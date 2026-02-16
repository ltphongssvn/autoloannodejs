// frontend/src/services/mfa.test.ts
import { getMfaStatus, setupMfa, enableMfa, disableMfa } from './mfa';
import { apiFetch } from './api';

jest.mock('./api', () => ({ apiFetch: jest.fn() }));
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => jest.clearAllMocks());

describe('MFA service', () => {
  it('getMfaStatus returns status', async () => {
    mockApiFetch.mockResolvedValue({
      data: { data: { mfa_enabled: true } }, headers: new Headers(),
    });
    const result = await getMfaStatus();
    expect(result).toEqual({ mfa_enabled: true });
    expect(mockApiFetch).toHaveBeenCalledWith('/users/mfa/status');
  });

  it('setupMfa returns qr_code and secret', async () => {
    const setup = { qr_code: 'data:image/png;base64,qr', secret: 'ABCD1234' }; //pragma: allowlist secret
    mockApiFetch.mockResolvedValue({
      data: { data: setup }, headers: new Headers(),
    });
    const result = await setupMfa();
    expect(result).toEqual(setup);
    expect(mockApiFetch).toHaveBeenCalledWith('/users/mfa/setup', { method: 'POST' });
  });

  it('enableMfa sends code', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });
    await enableMfa('123456');
    expect(mockApiFetch).toHaveBeenCalledWith('/users/mfa/enable', {
      method: 'POST', body: JSON.stringify({ code: '123456' }),
    });
  });

  it('disableMfa sends code', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });
    await disableMfa('654321');
    expect(mockApiFetch).toHaveBeenCalledWith('/users/mfa/disable', {
      method: 'POST', body: JSON.stringify({ code: '654321' }),
    });
  });
});
