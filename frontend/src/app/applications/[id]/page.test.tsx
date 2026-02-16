// frontend/src/app/applications/[id]/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import ApplicationDetailPage from './page';
import { useAuth } from '@/context/AuthContext';
import { getApplication } from '@/services/applications';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: '1' }),
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
  getApplication: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetApplication = getApplication as jest.MockedFunction<typeof getApplication>;

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

const mockApp = {
  id: 1,
  user_id: 1,
  application_number: 'AL-001',
  status: 'submitted' as const,
  current_step: 4,
  personal_info: { first_name: 'John', last_name: 'Doe' },
  car_details: { make: 'Toyota', model: 'Camry' },
  loan_details: { amount: '25000' },
  employment_info: { employer: 'Acme' },
  loan_term: 36,
  interest_rate: '5.9',
  monthly_payment: '450.00',
  submitted_at: '2024-06-15T10:00:00Z',
  decided_at: null,
  signature_data: null,
  signed_at: null,
  agreement_accepted: null,
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-15T10:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: mockUser,
    setUser: jest.fn(),
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
  });
});

describe('ApplicationDetailPage', () => {
  it('shows loading spinner while loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: true,
      logout: jest.fn(),
    });

    render(<ApplicationDetailPage />);
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

    render(<ApplicationDetailPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders application details', async () => {
    mockGetApplication.mockResolvedValue(mockApp);

    render(<ApplicationDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Application AL-001')).toBeInTheDocument();
    });

    expect(screen.getByTestId('status-chip')).toHaveTextContent('Submitted');
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Details')).toBeInTheDocument();
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Loan Details')).toBeInTheDocument();
    expect(screen.getByText('36 months')).toBeInTheDocument();
    expect(screen.getByText('5.9%')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('shows timeline timestamps when present', async () => {
    mockGetApplication.mockResolvedValue(mockApp);

    render(<ApplicationDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Application AL-001')).toBeInTheDocument();
    });

    // Timeline has both "Created" and "Submitted" labels
    expect(screen.getByText('Created')).toBeInTheDocument();
    // "Submitted" appears in both StatusChip and Timeline - use getAllByText
    const submittedElements = screen.getAllByText('Submitted');
    expect(submittedElements.length).toBeGreaterThanOrEqual(2);
  });

  it('shows error when fetch fails', async () => {
    mockGetApplication.mockRejectedValue(new Error('Not found'));

    render(<ApplicationDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });
  });

  it('shows generic error for non-Error throws', async () => {
    mockGetApplication.mockRejectedValue('unknown');

    render(<ApplicationDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load application')).toBeInTheDocument();
    });
  });

  it('renders back to dashboard link', async () => {
    mockGetApplication.mockResolvedValue(mockApp);

    render(<ApplicationDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('← Back to Dashboard')).toBeInTheDocument();
    });
  });
});
