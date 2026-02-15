// frontend/src/services/api.test.ts
import { apiFetch, setAuthToken, getAuthToken } from './api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  setAuthToken(null);
});

describe('setAuthToken / getAuthToken', () => {
  it('stores and retrieves token', () => {
    setAuthToken('test-token');
    expect(getAuthToken()).toBe('test-token');
    expect(localStorage.getItem('authToken')).toBe('test-token');
  });

  it('clears token when null', () => {
    setAuthToken('test-token');
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});

describe('apiFetch', () => {
  it('makes GET request with correct headers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'result' }),
      headers: new Headers(),
    });

    const result = await apiFetch('/test');
    expect(result.data).toEqual({ data: 'result' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('includes auth token in headers when set', async () => {
    setAuthToken('my-jwt');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'ok' }),
      headers: new Headers(),
    });

    await apiFetch('/protected');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-jwt',
        }),
      }),
    );
  });

  it('extracts token from Authorization response header', async () => {
    const responseHeaders = new Headers();
    responseHeaders.set('Authorization', 'Bearer new-token-123');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'ok' }),
      headers: responseHeaders,
    });

    await apiFetch('/login');
    expect(getAuthToken()).toBe('new-token-123');
  });

  it('throws error on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
      headers: new Headers(),
    });

    await expect(apiFetch('/fail')).rejects.toThrow('Unauthorized');
  });

  it('throws generic message when no error field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
      headers: new Headers(),
    });

    await expect(apiFetch('/fail')).rejects.toThrow('API request failed');
  });

  it('uses status.message for error when available', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ status: { message: 'Token expired' } }),
      headers: new Headers(),
    });

    await expect(apiFetch('/fail')).rejects.toThrow('Token expired');
  });

  it('passes custom options through', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'created' }),
      headers: new Headers(),
    });

    await apiFetch('/items', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      }),
    );
  });
});
