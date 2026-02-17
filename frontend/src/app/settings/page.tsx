// frontend/src/app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { LoadingSpinner, ErrorAlert, MfaSettings } from '@/components/common';

export default function SettingsPage() {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) return <LoadingSpinner />;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const { data } = await apiFetch<{ status: { code: number }; data: typeof user }>(
        '/users/profile',
        {
          method: 'PATCH',
          body: JSON.stringify({
            user: { first_name: firstName, last_name: lastName, phone: phone || null },
          }),
        },
      );
      setUser(data.data);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await apiFetch('/users/password', {
        method: 'PATCH',
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Password changed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700" role="alert">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <section className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section className="mb-8 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </section>

      {/* MFA Section */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Two-Factor Authentication</h2>
        <MfaSettings />
      </section>
    </div>
  );
}
