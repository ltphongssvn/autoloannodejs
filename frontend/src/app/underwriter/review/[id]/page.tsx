// frontend/src/app/underwriter/review/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { LoadingSpinner, ErrorAlert, StatusChip } from '@/components/common';
import type { Application, ApiResponse } from '@/types';

export default function UnderwriterReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [loanTerm, setLoanTerm] = useState('36');
  const [interestRate, setInterestRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'underwriter') {
      router.push('/dashboard');
      return;
    }

    const fetchApplication = async () => {
      try {
        const { data } = await apiFetch<ApiResponse<Application>>(
          `/underwriter/applications/${id}`,
        );
        setApplication(data.data);
        if (data.data.loan_term) setLoanTerm(String(data.data.loan_term));
        if (data.data.interest_rate) setInterestRate(data.data.interest_rate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id, user, authLoading, router]);

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!application) return;
    setError('');
    setActionSuccess('');
    setIsSubmitting(true);

    try {
      const body: Record<string, unknown> = { decision, note };
      if (decision === 'approve') {
        body.loan_term = Number(loanTerm);
        body.interest_rate = interestRate;
      }

      const { data } = await apiFetch<ApiResponse<Application>>(
        `/underwriter/applications/${application.id}/decide`,
        { method: 'POST', body: JSON.stringify(body) },
      );
      setApplication(data.data);
      setNote('');
      setActionSuccess(decision === 'approve' ? 'Application approved' : 'Application rejected');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decision failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) return <LoadingSpinner />;

  if (error && !application) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorAlert message={error} />
        <Link href="/underwriter" className="mt-4 inline-block text-blue-600 hover:underline">
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
          Analysis: {application.application_number}
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
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Applicant</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(application.personal_info).map(([key, value]) => (
            <div key={key}>
              <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
              <dd className="font-medium text-gray-900">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Financial Analysis */}
      <div className="mb-6 grid grid-cols-2 gap-6">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Employment</h2>
          <dl className="space-y-2 text-sm">
            {Object.entries(application.employment_info).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-medium text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Loan Request</h2>
          <dl className="space-y-2 text-sm">
            {Object.entries(application.loan_details).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-medium text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Vehicle */}
      <section className="mb-6 rounded-lg border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Vehicle</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(application.car_details).map(([key, value]) => (
            <div key={key}>
              <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
              <dd className="font-medium text-gray-900">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Decision Actions */}
      {application.status === 'under_review' && (
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Underwriting Decision</h2>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700">Loan Term (months)</label>
              <select id="loanTerm" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
                <option value="60">60</option>
                <option value="72">72</option>
              </select>
            </div>
            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
              <input id="interestRate" type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="e.g. 5.9" />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">Decision Note</label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Underwriting rationale..." />
          </div>

          <div className="flex gap-3">
            <button onClick={() => handleDecision('approve')} disabled={isSubmitting || !interestRate} className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
              Approve Loan
            </button>
            <button onClick={() => handleDecision('reject')} disabled={isSubmitting} className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50">
              Deny Loan
            </button>
          </div>
        </section>
      )}

      <div className="mt-6">
        <Link href="/underwriter" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
