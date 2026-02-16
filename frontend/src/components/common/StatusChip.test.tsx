// frontend/src/components/common/StatusChip.test.tsx
import { render, screen } from '@testing-library/react';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it.each([
    ['draft', 'Draft'],
    ['submitted', 'Submitted'],
    ['under_review', 'Under Review'],
    ['pending', 'Pending'],
    ['pending_documents', 'Pending Documents'],
    ['approved', 'Approved'],
    ['rejected', 'Rejected'],
  ])('renders "%s" as "%s"', (status, label) => {
    render(<StatusChip status={status} />);
    expect(screen.getByTestId('status-chip')).toHaveTextContent(label);
  });

  it('falls back to raw status for unknown values', () => {
    render(<StatusChip status="unknown_status" />);
    expect(screen.getByTestId('status-chip')).toHaveTextContent('unknown_status');
  });

  it('applies correct styling for approved', () => {
    render(<StatusChip status="approved" />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.className).toContain('bg-green-100');
    expect(chip.className).toContain('text-green-700');
  });

  it('applies default styling for unknown status', () => {
    render(<StatusChip status="unknown" />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.className).toContain('bg-gray-100');
  });
});
