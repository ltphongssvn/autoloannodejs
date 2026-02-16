// frontend/src/app/signup/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from './page';
import { useAuth } from '@/context/AuthContext';
import { signup } from '@/services/auth';

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

jest.mock('@/services/auth', () => ({
  signup: jest.fn(),
}));

const mockSetUser = jest.fn();
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSignup = signup as jest.MockedFunction<typeof signup>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: null,
    setUser: mockSetUser,
    isAuthenticated: false,
    isLoading: false,
    logout: jest.fn(),
  });
});

const fillForm = async () => {
  await userEvent.type(screen.getByLabelText('First Name'), 'John');
  await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
  await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
};

describe('SignupPage', () => {
  it('renders signup form with all fields', () => {
    render(<SignupPage />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    render(<SignupPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<SignupPage />);
    await userEvent.type(screen.getByLabelText('First Name'), 'John');
    await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('submits form and redirects on success', async () => {
    const mockUser = {
      id: 1,
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: null,
      role: 'customer' as const,
      full_name: 'John Doe',
      created_at: '2024-01-01',
    };
    mockSignup.mockResolvedValue(mockUser);

    render(<SignupPage />);
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'password123', //pragma: allowlist secret
          password_confirmation: 'password123', //pragma: allowlist secret
        }),
      );
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on signup failure', async () => {
    mockSignup.mockRejectedValue(new Error('Email already taken'));

    render(<SignupPage />);
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Email already taken')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows generic error for non-Error throws', async () => {
    mockSignup.mockRejectedValue('unknown');

    render(<SignupPage />);
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Signup failed')).toBeInTheDocument();
    });
  });

  it('disables button while submitting', async () => {
    mockSignup.mockImplementation(() => new Promise(() => {}));

    render(<SignupPage />);
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(screen.getByRole('button', { name: 'Creating account...' })).toBeDisabled();
  });

  it('dismisses error when dismiss clicked', async () => {
    mockSignup.mockRejectedValue(new Error('Bad request'));

    render(<SignupPage />);
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByText('Bad request')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Bad request')).not.toBeInTheDocument();
  });
});
