// frontend/src/app/settings/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from './page';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  apiFetch: jest.fn(),
}));

const mockSetUser = jest.fn();
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  phone: '555-1234',
  role: 'customer' as const,
  full_name: 'Test User',
  created_at: '2024-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: mockUser,
    setUser: mockSetUser,
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
  });
});

describe('SettingsPage', () => {
  it('shows loading while auth loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: true,
      logout: jest.fn(),
    });
    render(<SettingsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      setUser: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    });
    render(<SettingsPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders profile form with user data', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toHaveValue('Test');
    expect(screen.getByLabelText('Last Name')).toHaveValue('User');
    expect(screen.getByLabelText('Phone')).toHaveValue('555-1234');
  });

  it('renders password change form', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
  });

  it('updates profile successfully', async () => {
    const updatedUser = { ...mockUser, first_name: 'Updated' };
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: updatedUser },
      headers: new Headers(),
    });

    render(<SettingsPage />);
    await userEvent.clear(screen.getByLabelText('First Name'));
    await userEvent.type(screen.getByLabelText('First Name'), 'Updated');
    await userEvent.click(screen.getByText('Save Profile'));

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
    expect(mockSetUser).toHaveBeenCalledWith(updatedUser);
  });

  it('shows error on profile update failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Server error'));

    render(<SettingsPage />);
    await userEvent.click(screen.getByText('Save Profile'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('changes password successfully', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });

    render(<SettingsPage />);
    await userEvent.type(screen.getByLabelText('Current Password'), 'oldpass');
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass123');
    await userEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Current Password')).toHaveValue('');
    expect(screen.getByLabelText('New Password')).toHaveValue('');
  });

  it('shows error on password change failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Wrong password'));

    render(<SettingsPage />);
    await userEvent.type(screen.getByLabelText('Current Password'), 'wrong');
    await userEvent.type(screen.getByLabelText('New Password'), 'newpass');
    await userEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(screen.getByText('Wrong password')).toBeInTheDocument();
    });
  });

  it('dismisses error', async () => {
    mockApiFetch.mockRejectedValue(new Error('Error'));

    render(<SettingsPage />);
    await userEvent.click(screen.getByText('Save Profile'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });
});
