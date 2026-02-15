// frontend/src/services/auth.test.ts
import { login, signup, logout, getCurrentUser } from './auth';
import { apiFetch, setAuthToken } from './api';

jest.mock('./api', () => ({
  apiFetch: jest.fn(),
  setAuthToken: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('login', () => {
  it('sends credentials and returns user', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'customer' };
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: mockUser },
      headers: new Headers(),
    });

    const result = await login({ email: 'test@example.com', password: 'pass' }); //pragma: allowlist secret
    expect(result).toEqual(mockUser);
    expect(mockApiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user: { email: 'test@example.com', password: 'pass' } }),
    });
  });
});

describe('signup', () => {
  it('sends user data and returns user', async () => {
    const mockUser = { id: 2, email: 'new@example.com', role: 'customer' };
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 201 }, data: mockUser },
      headers: new Headers(),
    });

    const result = await signup({
      email: 'new@example.com',
      password: 'pass123', //pragma: allowlist secret
      password_confirmation: 'pass123', //pragma: allowlist secret
      first_name: 'John',
      last_name: 'Doe',
    });
    expect(result).toEqual(mockUser);
    expect(mockApiFetch).toHaveBeenCalledWith('/auth/signup', {
      method: 'POST',
      body: expect.stringContaining('new@example.com'),
    });
  });
});

describe('logout', () => {
  it('calls logout endpoint and clears token', async () => {
    mockApiFetch.mockResolvedValue({
      data: {},
      headers: new Headers(),
    });

    await logout();
    expect(mockApiFetch).toHaveBeenCalledWith('/auth/logout', { method: 'DELETE' });
    expect(setAuthToken).toHaveBeenCalledWith(null);
  });

  it('clears token even if API call fails', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));

    await logout();
    expect(setAuthToken).toHaveBeenCalledWith(null);
  });
});

describe('getCurrentUser', () => {
  it('fetches and returns current user', async () => {
    const mockUser = { id: 1, email: 'me@example.com', role: 'customer' };
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: mockUser },
      headers: new Headers(),
    });

    const result = await getCurrentUser();
    expect(result).toEqual(mockUser);
    expect(mockApiFetch).toHaveBeenCalledWith('/auth/me');
  });
});
