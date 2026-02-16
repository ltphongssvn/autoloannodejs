// frontend/src/components/common/ErrorAlert.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorAlert } from './ErrorAlert';

describe('ErrorAlert', () => {
  it('renders error message', () => {
    render(<ErrorAlert message="Something went wrong" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not show dismiss button when onDismiss not provided', () => {
    render(<ErrorAlert message="Error" />);
    expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
  });

  it('shows dismiss button and calls onDismiss when clicked', async () => {
    const onDismiss = jest.fn();
    render(<ErrorAlert message="Error" onDismiss={onDismiss} />);

    const button = screen.getByLabelText('Dismiss');
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
