// frontend/src/app/applications/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getApplication } from '@/services/applications';
import { LoadingSpinner, ErrorAlert, StatusChip } from '@/components/common';
import type { Application } from '@/types';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchApplication = async () => {
      try {
        const data = await getApplication(Number(id));
        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id, user, authLoading, router]);

  if (authLoading || isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorAlert message={error} />
        <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Application {application.application_number}
        </h1>
        <StatusChip status={application.status} />
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Personal Information</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(application.personal_info).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-medium text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Vehicle Details */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Vehicle Details</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(application.car_details).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-medium text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Loan Details */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Loan Details</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {application.loan_term && (
              <div>
                <dt className="text-gray-500">Term</dt>
                <dd className="font-medium text-gray-900">{application.loan_term} months</dd>
              </div>
            )}
            {application.interest_rate && (
              <div>
                <dt className="text-gray-500">Interest Rate</dt>
                <dd className="font-medium text-gray-900">{application.interest_rate}%</dd>
              </div>
            )}
            {application.monthly_payment && (
              <div>
                <dt className="text-gray-500">Monthly Payment</dt>
                <dd className="font-medium text-gray-900">${application.monthly_payment}</dd>
              </div>
            )}
            {Object.entries(application.loan_details).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-medium text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Timestamps */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Timeline</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Created</dt>
              <dd className="text-gray-900">{new Date(application.created_at).toLocaleString()}</dd>
            </div>
            {application.submitted_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900">{new Date(application.submitted_at).toLocaleString()}</dd>
              </div>
            )}
            {application.decided_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Decision</dt>
                <dd className="text-gray-900">{new Date(application.decided_at).toLocaleString()}</dd>
              </div>
            )}
            {application.signed_at && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Signed</dt>
                <dd className="text-gray-900">{new Date(application.signed_at).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <div className="mt-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
