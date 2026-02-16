// frontend/src/app/underwriter/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import UnderwriterDashboardPage from './page';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  apiFetch: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const underwriterUser = {
  id: 3,
  email: 'uw@example.com',
  first_name: 'Under',
  last_name: 'Writer',
  phone: null,
  role: 'underwriter' as const,
  full_name: 'Under Writer',
  created_at: '2024-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UnderwriterDashboardPage', () => {
  it('shows loading while auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: true,
      logout: jest.fn(),
    });

    render(<UnderwriterDashboardPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects non-underwriter users to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { ...underwriterUser, role: 'customer' },
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    render(<UnderwriterDashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects unauthenticated users to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    });

    render(<UnderwriterDashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders applications list', async () => {
    mockUseAuth.mockReturnValue({
      user: underwriterUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockApiFetch.mockResolvedValue({
      data: {
        status: { code: 200 },
        data: [
          {
            id: 1,
            application_number: 'AL-001',
            status: 'under_review',
            personal_info: { first_name: 'John', last_name: 'Doe' },
            submitted_at: '2024-06-15T10:00:00Z',
          },
        ],
      },
      headers: new Headers(),
    });

    render(<UnderwriterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Underwriter Dashboard')).toBeInTheDocument();
      expect(screen.getByText('AL-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Analyze')).toBeInTheDocument();
    });
  });

  it('shows empty state when no applications', async () => {
    mockUseAuth.mockReturnValue({
      user: underwriterUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: [] },
      headers: new Headers(),
    });

    render(<UnderwriterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No applications pending decision.')).toBeInTheDocument();
    });
  });

  it('shows error on fetch failure', async () => {
    mockUseAuth.mockReturnValue({
      user: underwriterUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockApiFetch.mockRejectedValue(new Error('Server error'));

    render(<UnderwriterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows dash for missing submitted_at', async () => {
    mockUseAuth.mockReturnValue({
      user: underwriterUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockApiFetch.mockResolvedValue({
      data: {
        status: { code: 200 },
        data: [
          {
            id: 2,
            application_number: 'AL-002',
            status: 'under_review',
            personal_info: { first_name: 'Jane', last_name: 'Smith' },
            submitted_at: null,
          },
        ],
      },
      headers: new Headers(),
    });

    render(<UnderwriterDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});
