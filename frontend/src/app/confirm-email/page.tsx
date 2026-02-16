// frontend/src/app/confirm-email/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/services/api';
import { LoadingSpinner, ErrorAlert } from '@/components/common';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid or missing confirmation token');
      return;
    }

    const confirmEmail = async () => {
      try {
        await apiFetch('/auth/confirm-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Confirmation failed');
      }
    };

    confirmEmail();
  }, [token]);

  if (status === 'loading') return <LoadingSpinner message="Confirming your email..." />;

  if (status === 'error') {
    return (
      <div className="mx-auto mt-16 max-w-md text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Confirmation Failed</h1>
        <ErrorAlert message={error} />
        <Link
          href="/login"
          className="mt-6 inline-block text-blue-600 hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Email Confirmed</h1>
      <p className="text-gray-600">
        Your email has been successfully confirmed. You can now sign in.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block text-blue-600 hover:underline"
      >
        Sign In
      </Link>
    </div>
  );
}
