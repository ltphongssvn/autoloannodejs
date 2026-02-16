// frontend/src/app/account-locked/page.tsx
import Link from 'next/link';

export default function AccountLockedPage() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <h1 className="mb-4 text-3xl font-bold text-red-600">Account Locked</h1>
      <p className="text-gray-600">
        Your account has been locked due to too many failed login attempts.
        Please contact support or try again later.
      </p>
      <Link
        href="/forgot-password"
        className="mt-6 inline-block text-blue-600 hover:underline"
      >
        Reset Password
      </Link>
      <div className="mt-2">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
