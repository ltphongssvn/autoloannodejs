// frontend/src/components/common/StatusChip.tsx
'use client';

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-orange-100 text-orange-700',
  pending_documents: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  pending: 'Pending',
  pending_documents: 'Pending Documents',
  approved: 'Approved',
  rejected: 'Rejected',
};

interface StatusChipProps {
  status: string;
}

export const StatusChip = ({ status }: StatusChipProps) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700';
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style}`}
      data-testid="status-chip"
    >
      {label}
    </span>
  );
};
