// frontend/src/components/layout/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from './Navbar';
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

const makeUser = (role: 'customer' | 'loan_officer' | 'underwriter') => ({
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  phone: null,
  role,
  full_name: 'Test User',
  created_at: '2024-01-01',
});

const authState = (role?: 'customer' | 'loan_officer' | 'underwriter') => ({
  user: role ? makeUser(role) : null,
  setUser: jest.fn(),
  isAuthenticated: !!role,
  isLoading: false,
  logout: jest.fn(),
});

beforeEach(() => jest.clearAllMocks());

describe('Navbar', () => {
  it('shows login/signup when not authenticated', () => {
    mockUseAuth.mockReturnValue(authState());
    render(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('shows dashboard, settings, email, logout when authenticated', () => {
    mockUseAuth.mockReturnValue(authState('customer'));
    render(<Navbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('links customer dashboard to /dashboard', () => {
    mockUseAuth.mockReturnValue(authState('customer'));
    render(<Navbar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('links officer dashboard to /officer', () => {
    mockUseAuth.mockReturnValue(authState('loan_officer'));
    render(<Navbar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/officer');
  });

  it('links underwriter dashboard to /underwriter', () => {
    mockUseAuth.mockReturnValue(authState('underwriter'));
    render(<Navbar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/underwriter');
  });

  it('calls logout when clicked', async () => {
    const state = authState('customer');
    mockUseAuth.mockReturnValue(state);
    render(<Navbar />);
    await userEvent.click(screen.getByText('Logout'));
    expect(state.logout).toHaveBeenCalledTimes(1);
  });
});
