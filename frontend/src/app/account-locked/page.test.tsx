// frontend/src/app/account-locked/page.test.tsx
import { render, screen } from '@testing-library/react';
import AccountLockedPage from './page';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('AccountLockedPage', () => {
  it('renders locked message', () => {
    render(<AccountLockedPage />);
    expect(screen.getByText('Account Locked')).toBeInTheDocument();
    expect(screen.getByText(/too many failed login attempts/)).toBeInTheDocument();
  });

  it('renders reset password link', () => {
    render(<AccountLockedPage />);
    const link = screen.getByText('Reset Password');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/forgot-password');
  });

  it('renders back to home link', () => {
    render(<AccountLockedPage />);
    const link = screen.getByText('Back to Home');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
