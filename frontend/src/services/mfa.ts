// frontend/src/services/mfa.ts
import { apiFetch } from './api';

interface MfaSetupResponse {
  qr_code: string;
  secret: string;
}

interface MfaStatusResponse {
  mfa_enabled: boolean;
}

export const getMfaStatus = async (): Promise<MfaStatusResponse> => {
  const { data } = await apiFetch<{ data: MfaStatusResponse }>('/users/mfa/status');
  return data.data;
};

export const setupMfa = async (): Promise<MfaSetupResponse> => {
  const { data } = await apiFetch<{ data: MfaSetupResponse }>('/users/mfa/setup', {
    method: 'POST',
  });
  return data.data;
};

export const enableMfa = async (code: string): Promise<void> => {
  await apiFetch('/users/mfa/enable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
};

export const disableMfa = async (code: string): Promise<void> => {
  await apiFetch('/users/mfa/disable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
};
