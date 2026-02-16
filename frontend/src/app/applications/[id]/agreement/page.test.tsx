// frontend/src/app/applications/[id]/agreement/page.test.tsx
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanAgreementPage from './page';
import { useAuth } from '@/context/AuthContext';
import { getApplication, signApplication } from '@/services/applications';

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
jest.mock('@/services/applications', () => ({
  getApplication: jest.fn(),
  signApplication: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetApplication = getApplication as jest.MockedFunction<typeof getApplication>;
const mockSignApplication = signApplication as jest.MockedFunction<typeof signApplication>;

const mockUser = {
  id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User',
  phone: null, role: 'customer' as const, full_name: 'Test User', created_at: '2024-01-01',
};

const approvedApp = {
  id: 1, user_id: 1, application_number: 'AL-001', status: 'approved' as const,
  current_step: 5, personal_info: {}, car_details: {}, loan_details: {},
  employment_info: {}, loan_term: 36, interest_rate: '5.9', monthly_payment: '450.00',
  submitted_at: '2024-06-15T10:00:00Z', decided_at: '2024-06-20T10:00:00Z',
  signature_data: null, signed_at: null, agreement_accepted: null,
  created_at: '2024-06-01T00:00:00Z', updated_at: '2024-06-20T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: mockUser, setUser: jest.fn(), isAuthenticated: true, isLoading: false, logout: jest.fn(),
  });
  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
  });
  HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,sig');
  HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn().mockReturnValue({
    left: 0, top: 0, right: 500, bottom: 150, width: 500, height: 150, x: 0, y: 0, toJSON: jest.fn(),
  });
});

const simulateSignature = (canvas: HTMLElement) => {
  fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
  fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
  fireEvent.mouseUp(canvas);
};

describe('LoanAgreementPage', () => {
  it('shows loading while auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null, setUser: jest.fn(), isAuthenticated: false, isLoading: true, logout: jest.fn(),
    });
    render(<LoanAgreementPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null, setUser: jest.fn(), isAuthenticated: false, isLoading: false, logout: jest.fn(),
    });
    render(<LoanAgreementPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders agreement terms', async () => {
    mockGetApplication.mockResolvedValue(approvedApp);
    render(<LoanAgreementPage />);

    await waitFor(() => {
      expect(screen.getByText('Loan Agreement')).toBeInTheDocument();
    });
    expect(screen.getByText('AL-001')).toBeInTheDocument();
    expect(screen.getByText('36 months')).toBeInTheDocument();
    expect(screen.getByText('5.9%')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
  });

  it('renders signature area for approved applications', async () => {
    mockGetApplication.mockResolvedValue(approvedApp);
    render(<LoanAgreementPage />);

    await waitFor(() => {
      expect(screen.getByText('Sign Agreement')).toBeInTheDocument();
    });
    expect(screen.getByText('I agree to the terms and conditions')).toBeInTheDocument();
    expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
    expect(screen.getByText('Sign & Submit')).toBeDisabled();
  });

  it('enables submit after agreeing and signing', async () => {
    mockGetApplication.mockResolvedValue(approvedApp);
    render(<LoanAgreementPage />);

    await waitFor(() => expect(screen.getByText('Sign Agreement')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('checkbox'));

    await act(async () => {
      simulateSignature(screen.getByTestId('signature-canvas'));
    });

    expect(screen.getByText('Sign & Submit')).not.toBeDisabled();
  });

  it('submits signature and redirects', async () => {
    mockGetApplication.mockResolvedValue(approvedApp);
    mockSignApplication.mockResolvedValue({ ...approvedApp, signed_at: '2024-07-01T00:00:00Z' });

    render(<LoanAgreementPage />);
    await waitFor(() => expect(screen.getByText('Sign Agreement')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
      simulateSignature(screen.getByTestId('signature-canvas'));
    });

    await userEvent.click(screen.getByText('Sign & Submit'));

    await waitFor(() => {
      expect(mockSignApplication).toHaveBeenCalledWith(1, 'data:image/png;base64,sig');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on sign failure', async () => {
    mockGetApplication.mockResolvedValue(approvedApp);
    mockSignApplication.mockRejectedValue(new Error('Sign failed'));

    render(<LoanAgreementPage />);
    await waitFor(() => expect(screen.getByText('Sign Agreement')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
      simulateSignature(screen.getByTestId('signature-canvas'));
    });

    await userEvent.click(screen.getByText('Sign & Submit'));

    await waitFor(() => {
      expect(screen.getByText('Sign failed')).toBeInTheDocument();
    });
  });

  it('shows signed status for already-signed applications', async () => {
    mockGetApplication.mockResolvedValue({
      ...approvedApp, signed_at: '2024-07-01T10:00:00Z',
    });

    render(<LoanAgreementPage />);
    await waitFor(() => {
      expect(screen.getByText(/Agreement signed on/)).toBeInTheDocument();
    });
    expect(screen.queryByText('Sign Agreement')).not.toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    mockGetApplication.mockRejectedValue(new Error('Not found'));
    render(<LoanAgreementPage />);

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });
  });

  it('clears signature on clear button click', async () => {
    mockGetApplication.mockResolvedValue(approvedApp);
    render(<LoanAgreementPage />);

    await waitFor(() => expect(screen.getByText('Sign Agreement')).toBeInTheDocument());

    await act(async () => {
      simulateSignature(screen.getByTestId('signature-canvas'));
    });

    await userEvent.click(screen.getByText('Clear Signature'));
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Sign & Submit')).toBeDisabled();
  });
});
