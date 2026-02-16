// frontend/src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const getDashboardPath = (role: string) => {
  if (role === 'loan_officer') return '/officer';
  if (role === 'underwriter') return '/underwriter';
  return '/dashboard';
};

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-600">
          AutoLoan
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link
                href={getDashboardPath(user.role)}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Settings
              </Link>
              <span className="text-sm text-gray-500">{user.email}</span>
              <button
                onClick={logout}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
