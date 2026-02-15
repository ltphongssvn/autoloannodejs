// frontend/src/services/applications.ts
import { apiFetch } from './api';
import type { Application, ApiResponse } from '@/types';

export const getApplications = async (): Promise<Application[]> => {
  const { data } = await apiFetch<ApiResponse<Application[]>>('/applications');
  return data.data;
};

export const getApplication = async (id: number): Promise<Application> => {
  const { data } = await apiFetch<ApiResponse<Application>>(
    `/applications/${id}`,
  );
  return data.data;
};

export const createApplication = async (
  application: Partial<Application>,
): Promise<Application> => {
  const { data } = await apiFetch<ApiResponse<Application>>('/applications', {
    method: 'POST',
    body: JSON.stringify({ application }),
  });
  return data.data;
};

export const updateApplication = async (
  id: number,
  application: Partial<Application>,
): Promise<Application> => {
  const { data } = await apiFetch<ApiResponse<Application>>(
    `/applications/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ application }),
    },
  );
  return data.data;
};

export const submitApplication = async (
  id: number,
): Promise<Application> => {
  const { data } = await apiFetch<ApiResponse<Application>>(
    `/applications/${id}/submit`,
    { method: 'POST' },
  );
  return data.data;
};

export const signApplication = async (
  id: number,
  signatureData: string,
): Promise<Application> => {
  const { data } = await apiFetch<ApiResponse<Application>>(
    `/applications/${id}/sign`,
    {
      method: 'POST',
      body: JSON.stringify({ signature_data: signatureData }),
    },
  );
  return data.data;
};

export const deleteApplication = async (id: number): Promise<void> => {
  await apiFetch(`/applications/${id}`, { method: 'DELETE' });
};
