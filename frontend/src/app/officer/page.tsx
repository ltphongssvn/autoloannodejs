// frontend/src/app/officer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { LoadingSpinner, ErrorAlert, StatusChip } from '@/components/common';
import type { Application, ApiResponse } from '@/types';

export default function LoanOfficerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'loan_officer') {
      router.push('/dashboard');
      return;
    }

    const fetchApplications = async () => {
      try {
        const { data } = await apiFetch<ApiResponse<Application[]>>(
          '/loan_officer/applications',
        );
        setApplications(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, authLoading, router]);

  if (authLoading || isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Loan Officer Dashboard
      </h1>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No applications to review.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Application #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {app.application_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(app.personal_info as Record<string, string>).first_name}{' '}
                    {(app.personal_info as Record<string, string>).last_name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusChip status={app.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/officer/review/${app.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
