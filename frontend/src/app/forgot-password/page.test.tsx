// frontend/src/app/forgot-password/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from './page';
import { apiFetch } from '@/services/api';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('@/services/api', () => ({
  apiFetch: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ForgotPasswordPage', () => {
  it('renders form with email field', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  it('renders back to sign in link', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
  });

  it('shows success message after submit', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      expect(screen.getByText(/password reset instructions/)).toBeInTheDocument();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });
  });

  it('shows error on failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Server error'));

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows generic error for non-Error throws', async () => {
    mockApiFetch.mockRejectedValue('unknown');

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() => {
      expect(screen.getByText('Request failed')).toBeInTheDocument();
    });
  });

  it('disables button while submitting', async () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {}));

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
  });

  it('dismisses error when dismiss clicked', async () => {
    mockApiFetch.mockRejectedValue(new Error('Bad request'));

    render(<ForgotPasswordPage />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() => {
      expect(screen.getByText('Bad request')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Bad request')).not.toBeInTheDocument();
  });
});
