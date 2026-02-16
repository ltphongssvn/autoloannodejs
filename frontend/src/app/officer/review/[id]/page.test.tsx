// frontend/src/app/officer/review/[id]/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OfficerReviewPage from './page';
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

const officerUser = {
  id: 2, email: 'officer@example.com', first_name: 'Loan', last_name: 'Officer',
  phone: null, role: 'loan_officer' as const, full_name: 'Loan Officer', created_at: '2024-01-01',
};

const mockApp = {
  id: 1, application_number: 'AL-001', status: 'submitted',
  personal_info: { first_name: 'John', last_name: 'Doe' },
  car_details: { make: 'Toyota', model: 'Camry' },
  loan_details: { amount: '25000' },
  employment_info: { employer: 'Acme' },
  loan_term: 36, interest_rate: null, monthly_payment: null,
  submitted_at: '2024-06-15T10:00:00Z', decided_at: null,
  signature_data: null, signed_at: null, agreement_accepted: null,
  created_at: '2024-06-01T00:00:00Z', updated_at: '2024-06-15T00:00:00Z',
};

const makeResponse = (data: unknown) => ({
  data: { status: { code: 200 }, data }, headers: new Headers(),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: officerUser, setUser: jest.fn(), isAuthenticated: true, isLoading: false, logout: jest.fn(),
  });
});

describe('OfficerReviewPage', () => {
  it('shows loading while auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null, setUser: jest.fn(), isAuthenticated: false, isLoading: true, logout: jest.fn(),
    });
    render(<OfficerReviewPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects non-officer to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { ...officerUser, role: 'customer' }, setUser: jest.fn(),
      isAuthenticated: true, isLoading: false, logout: jest.fn(),
    });
    render(<OfficerReviewPage />);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders application details for review', async () => {
    mockApiFetch.mockResolvedValue(makeResponse(mockApp));

    render(<OfficerReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Review: AL-001')).toBeInTheDocument();
    });
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Forward to Underwriting')).toBeInTheDocument();
    expect(screen.getByText('Request Documents')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('forwards application to underwriting', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/review')) {
        return Promise.resolve(makeResponse({ ...mockApp, status: 'under_review' }));
      }
      return Promise.resolve(makeResponse(mockApp));
    });

    render(<OfficerReviewPage />);
    await waitFor(() => expect(screen.getByText('Review: AL-001')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Note'), 'Looks good');
    await userEvent.click(screen.getByText('Forward to Underwriting'));

    await waitFor(() => {
      expect(screen.getByText('Application forwarded for underwriting')).toBeInTheDocument();
    });
  });

  it('requests documents', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/review')) {
        return Promise.resolve(makeResponse({ ...mockApp, status: 'pending_documents' }));
      }
      return Promise.resolve(makeResponse(mockApp));
    });

    render(<OfficerReviewPage />);
    await waitFor(() => expect(screen.getByText('Review: AL-001')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Request Documents'));

    await waitFor(() => {
      expect(screen.getByText('Documents requested from applicant')).toBeInTheDocument();
    });
  });

  it('rejects application', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/review')) {
        return Promise.resolve(makeResponse({ ...mockApp, status: 'rejected' }));
      }
      return Promise.resolve(makeResponse(mockApp));
    });

    render(<OfficerReviewPage />);
    await waitFor(() => expect(screen.getByText('Review: AL-001')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Reject'));

    await waitFor(() => {
      expect(screen.getByText('Application rejected')).toBeInTheDocument();
    });
  });

  it('shows error on action failure', async () => {
    let callCount = 0;
    mockApiFetch.mockImplementation(() => {
      callCount++;
      if (callCount > 1) {
        return Promise.reject(new Error('Forbidden'));
      }
      return Promise.resolve(makeResponse(mockApp));
    });

    render(<OfficerReviewPage />);
    await waitFor(() => expect(screen.getByText('Review: AL-001')).toBeInTheDocument());

    callCount = 1; // Reset so next call rejects
    await userEvent.click(screen.getByText('Forward to Underwriting'));

    await waitFor(() => {
      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });

  it('shows error when fetch fails', async () => {
    mockApiFetch.mockRejectedValue(new Error('Not found'));

    render(<OfficerReviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });
  });

  it('hides actions for non-actionable statuses', async () => {
    mockApiFetch.mockResolvedValue(makeResponse({ ...mockApp, status: 'approved' }));

    render(<OfficerReviewPage />);

    await waitFor(() => expect(screen.getByText('Review: AL-001')).toBeInTheDocument());
    expect(screen.queryByText('Forward to Underwriting')).not.toBeInTheDocument();
  });
});
