// frontend/src/app/applications/new/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewApplicationPage from './page';
import { useAuth } from '@/context/AuthContext';
import { createApplication, updateApplication, submitApplication } from '@/services/applications';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/applications', () => ({
  createApplication: jest.fn(),
  updateApplication: jest.fn(),
  submitApplication: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockCreate = createApplication as jest.MockedFunction<typeof createApplication>;
const mockUpdate = updateApplication as jest.MockedFunction<typeof updateApplication>;
const mockSubmit = submitApplication as jest.MockedFunction<typeof submitApplication>;

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
  id: 10,
  user_id: 1,
  application_number: 'AL-010',
  status: 'draft' as const,
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
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
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

describe('NewApplicationPage', () => {
  it('shows loading when auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: true,
      logout: jest.fn(),
    });

    render(<NewApplicationPage />);
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

    render(<NewApplicationPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders step 1 - personal info', () => {
    render(<NewApplicationPage />);
    expect(screen.getByText('New Application')).toBeInTheDocument();
    expect(screen.getByTestId('step-personal')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByLabelText('SSN')).toBeInTheDocument();
  });

  it('creates application and moves to step 2', async () => {
    mockCreate.mockResolvedValue(mockApp);

    render(<NewApplicationPage />);
    await userEvent.type(screen.getByLabelText('First Name'), 'John');
    await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
      expect(screen.getByTestId('step-vehicle')).toBeInTheDocument();
    });
  });

  it('updates application on step 2 next', async () => {
    mockCreate.mockResolvedValue(mockApp);
    mockUpdate.mockResolvedValue(mockApp);

    render(<NewApplicationPage />);
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByTestId('step-vehicle')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText('Make'), 'Toyota');
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(screen.getByTestId('step-loan')).toBeInTheDocument();
    });
  });

  it('navigates back from step 2 to step 1', async () => {
    mockCreate.mockResolvedValue(mockApp);

    render(<NewApplicationPage />);
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByTestId('step-vehicle')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('step-personal')).toBeInTheDocument();
  });

  it('shows review step with summary', async () => {
    mockCreate.mockResolvedValue(mockApp);
    mockUpdate.mockResolvedValue(mockApp);

    render(<NewApplicationPage />);

    // Fill personal info
    await userEvent.type(screen.getByLabelText('First Name'), 'John');
    await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-vehicle')).toBeInTheDocument());

    // Fill vehicle
    await userEvent.type(screen.getByLabelText('Make'), 'Toyota');
    await userEvent.type(screen.getByLabelText('Model'), 'Camry');
    await userEvent.type(screen.getByLabelText('Year'), '2024');
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-loan')).toBeInTheDocument());

    // Fill loan
    await userEvent.type(screen.getByLabelText('Loan Amount'), '25000');
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-employment')).toBeInTheDocument());

    // Fill employment
    await userEvent.type(screen.getByLabelText('Employer'), 'Acme');
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-review')).toBeInTheDocument());

    expect(screen.getByText('Review Your Application')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Toyota/)).toBeInTheDocument();
    expect(screen.getByText('Submit Application')).toBeInTheDocument();
  });

  it('submits application and redirects to dashboard', async () => {
    mockCreate.mockResolvedValue(mockApp);
    mockUpdate.mockResolvedValue(mockApp);
    mockSubmit.mockResolvedValue({ ...mockApp, status: 'submitted' });

    render(<NewApplicationPage />);

    // Navigate through all steps
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-vehicle')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-loan')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-employment')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-review')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(10);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on create failure', async () => {
    mockCreate.mockRejectedValue(new Error('Server error'));

    render(<NewApplicationPage />);
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows error on submit failure', async () => {
    mockCreate.mockResolvedValue(mockApp);
    mockUpdate.mockResolvedValue(mockApp);
    mockSubmit.mockRejectedValue(new Error('Validation failed'));

    render(<NewApplicationPage />);

    // Navigate to review
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-vehicle')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-loan')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-employment')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByTestId('step-review')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Submit Application'));

    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });

  it('disables Next button while saving', async () => {
    mockCreate.mockImplementation(() => new Promise(() => {}));

    render(<NewApplicationPage />);
    await userEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Saving...')).toBeDisabled();
  });
});
