// frontend/src/app/dashboard/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { useAuth } from '@/context/AuthContext';
import { getApplications } from '@/services/applications';

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

jest.mock('@/services/applications', () => ({
  getApplications: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetApplications = getApplications as jest.MockedFunction<typeof getApplications>;

const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  phone: null,
  role: 'customer' as const,
  full_name: 'Test User',
  created_at: '2024-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DashboardPage', () => {
  it('shows loading spinner while auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: true,
      logout: jest.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    });

    render(<DashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders applications list', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockGetApplications.mockResolvedValue([
      {
        id: 1,
        user_id: 1,
        application_number: 'AL-001',
        status: 'draft',
        current_step: 1,
        personal_info: {},
        car_details: {},
        loan_details: {},
        employment_info: {},
        loan_term: null,
        interest_rate: null,
        monthly_payment: null,
        submitted_at: null,
        decided_at: null,
        signature_data: null,
        signed_at: null,
        agreement_accepted: null,
        created_at: '2024-06-01T00:00:00Z',
        updated_at: '2024-06-01T00:00:00Z',
      },
    ]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('My Applications')).toBeInTheDocument();
      expect(screen.getByText('AL-001')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
    });
  });

  it('shows empty state when no applications', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockGetApplications.mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No applications yet.')).toBeInTheDocument();
      expect(screen.getByText('Start your first application')).toBeInTheDocument();
    });
  });

  it('shows error when fetching fails', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockGetApplications.mockRejectedValue(new Error('Network error'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows generic error for non-Error throws', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockGetApplications.mockRejectedValue('unknown');

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load applications')).toBeInTheDocument();
    });
  });

  it('renders New Application button', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      setUser: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    mockGetApplications.mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('New Application')).toBeInTheDocument();
    });
  });
});
