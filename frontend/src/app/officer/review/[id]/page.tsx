// frontend/src/app/officer/review/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { LoadingSpinner, ErrorAlert, StatusChip } from '@/components/common';
import type { Application, ApiResponse } from '@/types';

export default function OfficerReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'loan_officer') {
      router.push('/dashboard');
      return;
    }

    const fetchApplication = async () => {
      try {
        const { data } = await apiFetch<ApiResponse<Application>>(
          `/loan_officer/applications/${id}`,
        );
        setApplication(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id, user, authLoading, router]);

  const handleAction = async (action: 'approve' | 'reject' | 'request_documents') => {
    if (!application) return;
    setError('');
    setActionSuccess('');
    setIsSubmitting(true);

    try {
      const { data } = await apiFetch<ApiResponse<Application>>(
        `/loan_officer/applications/${application.id}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ action, note }),
        },
      );
      setApplication(data.data);
      setNote('');
      const messages: Record<string, string> = {
        approve: 'Application forwarded for underwriting',
        reject: 'Application rejected',
        request_documents: 'Documents requested from applicant',
      };
      setActionSuccess(messages[action]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) return <LoadingSpinner />;

  if (error && !application) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorAlert message={error} />
        <Link href="/officer" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Review: {application.application_number}
        </h1>
        <StatusChip status={application.status} />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700" role="alert">
          {actionSuccess}
        </div>
      )}

      {/* Applicant Info */}
      <section className="mb-6 rounded-lg border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Applicant Information</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(application.personal_info).map(([key, value]) => (
            <div key={key}>
              <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
              <dd className="font-medium text-gray-900">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Vehicle & Loan */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Vehicle</h2>
          <dl className="space-y-2 text-sm">
            {Object.entries(application.car_details).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-medium text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Loan</h2>
          <dl className="space-y-2 text-sm">
            {Object.entries(application.loan_details).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-medium text-gray-900">{String(value)}</dd>
              </div>
            ))}
            {application.loan_term && (
              <div><dt className="text-gray-500">term</dt><dd className="font-medium text-gray-900">{application.loan_term} months</dd></div>
            )}
          </dl>
        </section>
      </div>

      {/* Employment */}
      <section className="mb-6 rounded-lg border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Employment</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(application.employment_info).map(([key, value]) => (
            <div key={key}>
              <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
              <dd className="font-medium text-gray-900">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Actions */}
      {['submitted', 'pending_documents'].includes(application.status) && (
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Review Actions</h2>
          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">Note</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Add a note for this action..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('approve')}
              disabled={isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Forward to Underwriting
            </button>
            <button
              onClick={() => handleAction('request_documents')}
              disabled={isSubmitting}
              className="rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              Request Documents
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={isSubmitting}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </section>
      )}

      <div className="mt-6">
        <Link href="/officer" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
