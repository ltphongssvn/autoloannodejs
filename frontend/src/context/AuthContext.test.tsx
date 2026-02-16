// frontend/src/context/AuthContext.test.tsx
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { getAuthToken, setAuthToken } from '@/services/api';
import { getCurrentUser } from '@/services/auth';

jest.mock('@/services/api', () => ({
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
}));

jest.mock('@/services/auth', () => ({
  getCurrentUser: jest.fn(),
}));

const mockGetAuthToken = getAuthToken as jest.MockedFunction<typeof getAuthToken>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

const TestConsumer = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthProvider', () => {
  it('shows loading then unauthenticated when no token', async () => {
    mockGetAuthToken.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('restores session when token exists', async () => {
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
    mockGetAuthToken.mockReturnValue('valid-token');
    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('clears token when session restore fails', async () => {
    mockGetAuthToken.mockReturnValue('expired-token');
    mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(setAuthToken).toHaveBeenCalledWith(null);
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('logout clears user and token', async () => {
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
    mockGetAuthToken.mockReturnValue('valid-token');
    mockGetCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(setAuthToken).toHaveBeenCalledWith(null);
  });
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth must be used within AuthProvider',
    );
    spy.mockRestore();
  });
});
