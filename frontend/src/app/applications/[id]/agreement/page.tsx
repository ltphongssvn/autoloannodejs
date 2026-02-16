// frontend/src/app/applications/[id]/agreement/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getApplication, signApplication } from '@/services/applications';
import { LoadingSpinner, ErrorAlert, StatusChip } from '@/components/common';
import type { Application } from '@/types';

export default function LoanAgreementPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchApp = async () => {
      try {
        const data = await getApplication(Number(id));
        setApplication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [id, user, authLoading, router]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSign = async () => {
    if (!application || !canvasRef.current) return;
    setError('');
    setIsSubmitting(true);

    try {
      const signatureData = canvasRef.current.toDataURL();
      await signApplication(application.id, signatureData);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) return <LoadingSpinner />;

  if (error && !application) {
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

  const canSign = application.status === 'approved' && !application.signed_at;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Loan Agreement</h1>
        <StatusChip status={application.status} />
      </div>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Agreement Terms */}
      <section className="mb-6 rounded-lg border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Agreement Terms</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Application:</strong> {application.application_number}</p>
          {application.loan_term && <p><strong>Loan Term:</strong> {application.loan_term} months</p>}
          {application.interest_rate && <p><strong>Interest Rate:</strong> {application.interest_rate}%</p>}
          {application.monthly_payment && <p><strong>Monthly Payment:</strong> ${application.monthly_payment}</p>}
        </div>
        <div className="mt-4 rounded-md bg-gray-50 p-4 text-xs text-gray-600">
          <p>
            By signing this agreement, you acknowledge and agree to the terms and conditions
            of this auto loan. You agree to make all payments on time and understand that
            failure to do so may result in penalties and affect your credit score.
          </p>
        </div>
      </section>

      {/* Signature Area */}
      {canSign && (
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Sign Agreement</h2>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-gray-300"
              />
              I agree to the terms and conditions
            </label>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">Draw your signature below:</p>
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full cursor-crosshair rounded-md border-2 border-dashed border-gray-300 bg-white"
              data-testid="signature-canvas"
            />
            <button
              onClick={clearSignature}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Signature
            </button>
          </div>

          <button
            onClick={handleSign}
            disabled={isSubmitting || !agreed || !hasSigned}
            className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing...' : 'Sign & Submit'}
          </button>
        </section>
      )}

      {application.signed_at && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-green-700">
            Agreement signed on {new Date(application.signed_at).toLocaleString()}
          </p>
        </div>
      )}

      <div className="mt-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
