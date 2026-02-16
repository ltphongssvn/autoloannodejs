// frontend/src/app/confirm-email/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import ConfirmEmailPage from './page';
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

describe('ConfirmEmailPage', () => {
  it('shows loading while confirming', () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {}));
    render(<ConfirmEmailPage />);
    expect(screen.getByText('Confirming your email...')).toBeInTheDocument();
  });

  it('shows success after confirmation', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });

    render(<ConfirmEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Email Confirmed')).toBeInTheDocument();
      expect(screen.getByText(/successfully confirmed/)).toBeInTheDocument();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/auth/confirm-email', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-token' }),
    });
  });

  it('shows error when token is missing', async () => {
    mockToken = '';
    render(<ConfirmEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirmation Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid or missing confirmation token')).toBeInTheDocument();
    });

    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('shows error on API failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Token expired'));

    render(<ConfirmEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirmation Failed')).toBeInTheDocument();
      expect(screen.getByText('Token expired')).toBeInTheDocument();
    });
  });

  it('shows generic error for non-Error throws', async () => {
    mockApiFetch.mockRejectedValue('unknown');

    render(<ConfirmEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Confirmation failed')).toBeInTheDocument();
    });
  });

  it('shows sign in link on success', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });

    render(<ConfirmEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });
});
