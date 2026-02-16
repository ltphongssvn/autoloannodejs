// frontend/src/services/documents.ts
import { apiFetch } from './api';
import type { Document, ApiResponse } from '@/types';

export const getDocuments = async (applicationId: number): Promise<Document[]> => {
  const { data } = await apiFetch<ApiResponse<Document[]>>(
    `/applications/${applicationId}/documents`,
  );
  return data.data;
};

export const uploadDocument = async (
  applicationId: number,
  file: File,
  docType: string,
): Promise<Document> => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/applications/${applicationId}/documents`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  return data.data;
};

export const deleteDocument = async (
  applicationId: number,
  documentId: number,
): Promise<void> => {
  await apiFetch(`/applications/${applicationId}/documents/${documentId}`, {
    method: 'DELETE',
  });
};
