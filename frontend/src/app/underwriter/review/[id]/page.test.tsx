// frontend/src/app/underwriter/review/[id]/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnderwriterReviewPage from './page';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';

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

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/services/api', () => ({ apiFetch: jest.fn() }));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const uwUser = {
  id: 3, email: 'uw@example.com', first_name: 'Under', last_name: 'Writer',
  phone: null, role: 'underwriter' as const, full_name: 'Under Writer', created_at: '2024-01-01',
};

const mockApp = {
  id: 1, application_number: 'AL-001', status: 'under_review',
  personal_info: { first_name: 'John', last_name: 'Doe' },
  car_details: { make: 'Toyota', model: 'Camry' },
  loan_details: { amount: '25000' },
  employment_info: { employer: 'Acme', monthly_income: '5000' },
  loan_term: null, interest_rate: null, monthly_payment: null,
  submitted_at: '2024-06-15T10:00:00Z', decided_at: null,
  signature_data: null, signed_at: null, agreement_accepted: null,
  created_at: '2024-06-01T00:00:00Z', updated_at: '2024-06-15T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: uwUser, setUser: jest.fn(), isAuthenticated: true, isLoading: false, logout: jest.fn(),
  });
});

describe('UnderwriterReviewPage', () => {
  it('shows loading while auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null, setUser: jest.fn(), isAuthenticated: false, isLoading: true, logout: jest.fn(),
    });
    render(<UnderwriterReviewPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects non-underwriter to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { ...uwUser, role: 'customer' }, setUser: jest.fn(),
      isAuthenticated: true, isLoading: false, logout: jest.fn(),
    });
    render(<UnderwriterReviewPage />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders application for analysis', async () => {
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: mockApp }, headers: new Headers(),
    });

    render(<UnderwriterReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Analysis: AL-001')).toBeInTheDocument();
    });
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Approve Loan')).toBeInTheDocument();
    expect(screen.getByText('Deny Loan')).toBeInTheDocument();
    expect(screen.getByLabelText('Interest Rate (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Loan Term (months)')).toBeInTheDocument();
  });

  it('approves application with loan terms', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ data: { status: { code: 200 }, data: mockApp }, headers: new Headers() })
      .mockResolvedValueOnce({ data: { status: { code: 200 }, data: { ...mockApp, status: 'approved' } }, headers: new Headers() });

    render(<UnderwriterReviewPage />);
    await waitFor(() => expect(screen.getByText('Analysis: AL-001')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Interest Rate (%)'), '5.9');
    await userEvent.type(screen.getByLabelText('Decision Note'), 'Good credit');
    await userEvent.click(screen.getByText('Approve Loan'));

    await waitFor(() => {
      expect(screen.getByText('Application approved')).toBeInTheDocument();
    });
  });

  it('denies application', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ data: { status: { code: 200 }, data: mockApp }, headers: new Headers() })
      .mockResolvedValueOnce({ data: { status: { code: 200 }, data: { ...mockApp, status: 'rejected' } }, headers: new Headers() });

    render(<UnderwriterReviewPage />);
    await waitFor(() => expect(screen.getByText('Analysis: AL-001')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Decision Note'), 'High risk');
    await userEvent.click(screen.getByText('Deny Loan'));

    await waitFor(() => {
      expect(screen.getByText('Application rejected')).toBeInTheDocument();
    });
  });

  it('disables approve when no interest rate', async () => {
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: mockApp }, headers: new Headers(),
    });

    render(<UnderwriterReviewPage />);
    await waitFor(() => expect(screen.getByText('Analysis: AL-001')).toBeInTheDocument());

    expect(screen.getByText('Approve Loan')).toBeDisabled();
  });

  it('shows error on decision failure', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ data: { status: { code: 200 }, data: mockApp }, headers: new Headers() })
      .mockRejectedValueOnce(new Error('Forbidden'));

    render(<UnderwriterReviewPage />);
    await waitFor(() => expect(screen.getByText('Analysis: AL-001')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Deny Loan'));

    await waitFor(() => {
      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });

  it('shows error when fetch fails', async () => {
    mockApiFetch.mockRejectedValue(new Error('Not found'));

    render(<UnderwriterReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });
  });

  it('hides actions for non-under_review status', async () => {
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: { ...mockApp, status: 'approved' } }, headers: new Headers(),
    });

    render(<UnderwriterReviewPage />);
    await waitFor(() => expect(screen.getByText('Analysis: AL-001')).toBeInTheDocument());
    expect(screen.queryByText('Approve Loan')).not.toBeInTheDocument();
  });
});
