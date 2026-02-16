// frontend/src/app/reset-password/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordPage from './page';
import { apiFetch } from '@/services/api';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('@/services/api', () => ({
  apiFetch: jest.fn(),
}));

let mockToken = 'valid-token';
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'token' ? mockToken : null),
  }),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  jest.clearAllMocks();
  mockToken = 'valid-token';
});

describe('ResetPasswordPage', () => {
  it('renders form with password fields', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });

  it('renders back to sign in link', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText('New Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('shows error when token is missing', async () => {
    mockToken = '';
    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText('New Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(screen.getByText('Invalid or missing reset token')).toBeInTheDocument();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('shows success message after reset', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByText('Password Reset')).toBeInTheDocument();
      expect(screen.getByText(/successfully reset/)).toBeInTheDocument();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        password: 'newpass123', //pragma: allowlist secret
        password_confirmation: 'newpass123', //pragma: allowlist secret
      }),
    });
  });

  it('shows error on API failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Token expired'));

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByText('Token expired')).toBeInTheDocument();
    });
  });

  it('shows generic error for non-Error throws', async () => {
    mockApiFetch.mockRejectedValue('unknown');

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByText('Reset failed')).toBeInTheDocument();
    });
  });

  it('disables button while submitting', async () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {}));

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    expect(screen.getByRole('button', { name: 'Resetting...' })).toBeDisabled();
  });

  it('dismisses error when dismiss clicked', async () => {
    mockApiFetch.mockRejectedValue(new Error('Bad request'));

    render(<ResetPasswordPage />);
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(screen.getByText('Bad request')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Bad request')).not.toBeInTheDocument();
  });
});
