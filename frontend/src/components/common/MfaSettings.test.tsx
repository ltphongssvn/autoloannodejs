// frontend/src/components/common/MfaSettings.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MfaSettings } from './MfaSettings';
import { getMfaStatus, setupMfa, enableMfa, disableMfa } from '@/services/mfa';

jest.mock('@/services/mfa', () => ({
  getMfaStatus: jest.fn(),
  setupMfa: jest.fn(),
  enableMfa: jest.fn(),
  disableMfa: jest.fn(),
}));

const mockGetStatus = getMfaStatus as jest.MockedFunction<typeof getMfaStatus>;
const mockSetup = setupMfa as jest.MockedFunction<typeof setupMfa>;
const mockEnable = enableMfa as jest.MockedFunction<typeof enableMfa>;
const mockDisable = disableMfa as jest.MockedFunction<typeof disableMfa>;

beforeEach(() => jest.clearAllMocks());

describe('MfaSettings', () => {
  it('shows loading then disabled status', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: false });
    render(<MfaSettings />);

    expect(screen.getByText('Loading MFA status...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Disabled')).toBeInTheDocument());
    expect(screen.getByText('Set Up MFA')).toBeInTheDocument();
  });

  it('shows enabled status with disable form', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: true });
    render(<MfaSettings />);

    await waitFor(() => expect(screen.getByText('Enabled')).toBeInTheDocument());
    expect(screen.getByText('Disable MFA')).toBeInTheDocument();
    expect(screen.queryByText('Set Up MFA')).not.toBeInTheDocument();
  });

  it('shows error on status fetch failure', async () => {
    mockGetStatus.mockRejectedValue(new Error('Network error'));
    render(<MfaSettings />);

    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument());
  });

  it('shows QR code after setup', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: false });
    const setupData = { qr_code: 'data:image/png;base64,qr', secret: 'TOTP1234' }; // pragma: allowlist secret
    mockSetup.mockResolvedValue(setupData);

    render(<MfaSettings />);
    await waitFor(() => expect(screen.getByText('Set Up MFA')).toBeInTheDocument());

    await userEvent.click(screen.getByText('Set Up MFA'));

    await waitFor(() => {
      expect(screen.getByAltText('MFA QR Code')).toBeInTheDocument();
      expect(screen.getByText('TOTP1234')).toBeInTheDocument();
      expect(screen.getByText('Enable MFA')).toBeInTheDocument();
    });
  });

  it('enables MFA with valid code', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: false });
    const setupData = { qr_code: 'data:qr', secret: 'KEY' }; // pragma: allowlist secret
    mockSetup.mockResolvedValue(setupData);
    mockEnable.mockResolvedValue(undefined);

    render(<MfaSettings />);
    await waitFor(() => expect(screen.getByText('Set Up MFA')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Set Up MFA'));

    await waitFor(() => expect(screen.getByLabelText('Verification Code')).toBeInTheDocument());
    await userEvent.type(screen.getByLabelText('Verification Code'), '123456');
    await userEvent.click(screen.getByText('Enable MFA'));

    await waitFor(() => {
      expect(screen.getByText('MFA enabled successfully')).toBeInTheDocument();
      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });
  });

  it('shows error on enable failure', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: false });
    const setupData = { qr_code: 'data:qr', secret: 'KEY' }; // pragma: allowlist secret
    mockSetup.mockResolvedValue(setupData);
    mockEnable.mockRejectedValue(new Error('Invalid code'));

    render(<MfaSettings />);
    await waitFor(() => expect(screen.getByText('Set Up MFA')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Set Up MFA'));

    await waitFor(() => expect(screen.getByLabelText('Verification Code')).toBeInTheDocument());
    await userEvent.type(screen.getByLabelText('Verification Code'), '000000');
    await userEvent.click(screen.getByText('Enable MFA'));

    await waitFor(() => expect(screen.getByText('Invalid code')).toBeInTheDocument());
  });

  it('disables MFA with valid code', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: true });
    mockDisable.mockResolvedValue(undefined);

    render(<MfaSettings />);
    await waitFor(() => expect(screen.getByText('Enabled')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Enter code to disable MFA'), '123456');
    await userEvent.click(screen.getByText('Disable MFA'));

    await waitFor(() => {
      expect(screen.getByText('MFA disabled successfully')).toBeInTheDocument();
      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
  });

  it('shows error on disable failure', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: true });
    mockDisable.mockRejectedValue(new Error('Wrong code'));

    render(<MfaSettings />);
    await waitFor(() => expect(screen.getByText('Enabled')).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText('Enter code to disable MFA'), '000000');
    await userEvent.click(screen.getByText('Disable MFA'));

    await waitFor(() => expect(screen.getByText('Wrong code')).toBeInTheDocument());
  });

  it('shows error on setup failure', async () => {
    mockGetStatus.mockResolvedValue({ mfa_enabled: false });
    mockSetup.mockRejectedValue(new Error('Setup failed'));

    render(<MfaSettings />);
    await waitFor(() => expect(screen.getByText('Set Up MFA')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Set Up MFA'));

    await waitFor(() => expect(screen.getByText('Setup failed')).toBeInTheDocument());
  });
});
