// frontend/src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import LandingPage from './page';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LandingPage', () => {
  it('shows Apply Now and Sign In when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    });

    render(<LandingPage />);
    expect(screen.getByText('Apply Now')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument();
  });

  it('shows Go to Dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        role: 'customer',
        full_name: 'Test User',
        created_at: '2024-01-01',
      },
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    render(<LandingPage />);
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Apply Now')).not.toBeInTheDocument();
  });

  it('renders heading and description', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    });

    render(<LandingPage />);
    expect(screen.getByText('Approved Fast')).toBeInTheDocument();
    expect(screen.getByText(/Apply for an auto loan/)).toBeInTheDocument();
  });
});
