// frontend/src/components/common/DocumentManager.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { getDocuments, uploadDocument, deleteDocument } from '@/services/documents';
import { ErrorAlert } from './ErrorAlert';
import type { Document } from '@/types';

interface DocumentManagerProps {
  applicationId: number;
  readOnly?: boolean;
}

export const DocumentManager = ({ applicationId, readOnly = false }: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [docType, setDocType] = useState('drivers_license');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDocuments(applicationId);
        setDocuments(docs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, [applicationId]);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setError('');
    setIsUploading(true);

    try {
      const doc = await uploadDocument(applicationId, file, docType);
      setDocuments((prev) => [...prev, doc]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    setError('');
    try {
      await deleteDocument(applicationId, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading documents...</p>;

  return (
    <div>
      {error && (
        <div className="mb-3">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">No documents uploaded.</p>
      ) : (
        <ul className="mb-4 divide-y rounded-md border">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="font-medium text-gray-900">{doc.file_name}</span>
                <span className="ml-2 text-gray-500">({doc.doc_type.replace(/_/g, ' ')})</span>
              </div>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <div className="flex items-end gap-3">
          <div>
            <label htmlFor="docType" className="block text-sm font-medium text-gray-700">Type</label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="drivers_license">Driver&apos;s License</option>
              <option value="proof_income">Proof of Income</option>
              <option value="proof_insurance">Proof of Insurance</option>
              <option value="proof_residence">Proof of Residence</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">File</label>
            <input
              id="fileUpload"
              type="file"
              ref={fileInputRef}
              className="mt-1 text-sm"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
};
