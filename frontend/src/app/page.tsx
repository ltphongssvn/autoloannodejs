// frontend/src/app/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center py-20 text-center">
      <h1 className="text-5xl font-bold text-gray-900">
        Get Your Auto Loan <span className="text-blue-600">Approved Fast</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-gray-600">
        Apply for an auto loan in minutes. Our streamlined process makes it easy
        to get the financing you need for your next vehicle.
      </p>
      <div className="mt-10 flex gap-4">
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700"
            >
              Apply Now
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-8 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
