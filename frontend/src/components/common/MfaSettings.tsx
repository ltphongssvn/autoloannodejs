// frontend/src/components/common/MfaSettings.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMfaStatus, setupMfa, enableMfa, disableMfa } from '@/services/mfa';
import { ErrorAlert } from './ErrorAlert';

export const MfaSettings = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getMfaStatus();
        setMfaEnabled(status.mfa_enabled);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load MFA status');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSetup = async () => {
    setError('');
    setSuccess('');
    try {
      const data = await setupMfa();
      setQrCode(data.qr_code);
      setSecret(data.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup MFA');
    }
  };

  const handleEnable = async () => {
    if (!code) return;
    setError('');
    setIsSubmitting(true);
    try {
      await enableMfa(code);
      setMfaEnabled(true);
      setQrCode('');
      setSecret('');
      setCode('');
      setSuccess('MFA enabled successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (!code) return;
    setError('');
    setIsSubmitting(true);
    try {
      await disableMfa(code);
      setMfaEnabled(false);
      setCode('');
      setSuccess('MFA disabled successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading MFA status...</p>;

  return (
    <div>
      {error && (
        <div className="mb-3">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}
      {success && (
        <p className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</p>
      )}

      <p className="mb-4 text-sm text-gray-700">
        Status: <span className={mfaEnabled ? 'font-medium text-green-600' : 'font-medium text-gray-500'}>
          {mfaEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </p>

      {!mfaEnabled && !qrCode && (
        <button
          onClick={handleSetup}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Set Up MFA
        </button>
      )}

      {qrCode && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">Scan this QR code with your authenticator app:</p>
            <img src={qrCode} alt="MFA QR Code" className="mx-auto h-48 w-48" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Or enter this secret manually:</p>
            <code className="block mt-1 rounded bg-gray-100 p-2 text-sm font-mono">{secret}</code>
          </div>
          <div>
            <label htmlFor="mfaEnableCode" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="mfaEnableCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="mt-1 w-40 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleEnable}
            disabled={isSubmitting || code.length < 6}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying...' : 'Enable MFA'}
          </button>
        </div>
      )}

      {mfaEnabled && (
        <div className="space-y-3">
          <div>
            <label htmlFor="mfaDisableCode" className="block text-sm font-medium text-gray-700">
              Enter code to disable MFA
            </label>
            <input
              id="mfaDisableCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="mt-1 w-40 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleDisable}
            disabled={isSubmitting || code.length < 6}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Disabling...' : 'Disable MFA'}
          </button>
        </div>
      )}
    </div>
  );
};
