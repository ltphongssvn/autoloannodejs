// frontend/src/components/common/DocumentManager.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentManager } from './DocumentManager';
import { getDocuments, uploadDocument, deleteDocument } from '@/services/documents';

jest.mock('@/services/documents', () => ({
  getDocuments: jest.fn(),
  uploadDocument: jest.fn(),
  deleteDocument: jest.fn(),
}));

const mockGetDocs = getDocuments as jest.MockedFunction<typeof getDocuments>;
const mockUpload = uploadDocument as jest.MockedFunction<typeof uploadDocument>;
const mockDelete = deleteDocument as jest.MockedFunction<typeof deleteDocument>;

beforeEach(() => jest.clearAllMocks());

const mockDocs = [
  { id: 1, application_id: 1, doc_type: 'drivers_license', file_name: 'dl.pdf', file_url: '/dl.pdf', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, application_id: 1, doc_type: 'proof_income', file_name: 'pay.pdf', file_url: '/pay.pdf', created_at: '2024-01-01', updated_at: '2024-01-01' },
];

describe('DocumentManager', () => {
  it('shows loading then documents', async () => {
    mockGetDocs.mockResolvedValue(mockDocs);
    render(<DocumentManager applicationId={1} />);

    expect(screen.getByText('Loading documents...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('dl.pdf')).toBeInTheDocument();
      expect(screen.getByText('pay.pdf')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockGetDocs.mockResolvedValue([]);
    render(<DocumentManager applicationId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No documents uploaded.')).toBeInTheDocument();
    });
  });

  it('shows error on fetch failure', async () => {
    mockGetDocs.mockRejectedValue(new Error('Fetch failed'));
    render(<DocumentManager applicationId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });

  it('uploads a document', async () => {
    mockGetDocs.mockResolvedValue([]);
    const newDoc = { id: 3, application_id: 1, doc_type: 'other', file_name: 'new.pdf', file_url: '/new.pdf', created_at: '2024-01-01', updated_at: '2024-01-01' };
    mockUpload.mockResolvedValue(newDoc);

    render(<DocumentManager applicationId={1} />);
    await waitFor(() => expect(screen.getByText('No documents uploaded.')).toBeInTheDocument());

    const file = new File(['content'], 'new.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('File');
    await userEvent.upload(input, file);
    await userEvent.click(screen.getByText('Upload'));

    await waitFor(() => {
      expect(screen.getByText('new.pdf')).toBeInTheDocument();
    });
  });

  it('shows error on upload failure', async () => {
    mockGetDocs.mockResolvedValue([]);
    mockUpload.mockRejectedValue(new Error('Too large'));

    render(<DocumentManager applicationId={1} />);
    await waitFor(() => expect(screen.getByText('No documents uploaded.')).toBeInTheDocument());

    const file = new File(['x'], 'big.pdf');
    await userEvent.upload(screen.getByLabelText('File'), file);
    await userEvent.click(screen.getByText('Upload'));

    await waitFor(() => {
      expect(screen.getByText('Too large')).toBeInTheDocument();
    });
  });

  it('deletes a document', async () => {
    mockGetDocs.mockResolvedValue(mockDocs);
    mockDelete.mockResolvedValue(undefined);

    render(<DocumentManager applicationId={1} />);
    await waitFor(() => expect(screen.getByText('dl.pdf')).toBeInTheDocument());

    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('dl.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('pay.pdf')).toBeInTheDocument();
    });
  });

  it('hides upload and delete in readOnly mode', async () => {
    mockGetDocs.mockResolvedValue(mockDocs);
    render(<DocumentManager applicationId={1} readOnly />);

    await waitFor(() => expect(screen.getByText('dl.pdf')).toBeInTheDocument());
    expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
