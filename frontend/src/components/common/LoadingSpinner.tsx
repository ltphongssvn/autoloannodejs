// frontend/src/components/common/LoadingSpinner.tsx
'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({
  message = 'Loading...',
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
};
