// frontend/src/components/common/ErrorAlert.tsx
'use client';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => {
  return (
    <div
      className="relative rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      role="alert"
    >
      <p>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 text-red-500 hover:text-red-700"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};
