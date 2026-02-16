// frontend/src/services/documents.test.ts
import { getDocuments, uploadDocument, deleteDocument } from './documents';
import { apiFetch } from './api';

jest.mock('./api', () => ({
  apiFetch: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getDocuments', () => {
  it('fetches documents for application', async () => {
    const docs = [{ id: 1, doc_type: 'drivers_license', file_name: 'dl.pdf' }];
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: docs },
      headers: new Headers(),
    });

    const result = await getDocuments(1);
    expect(result).toEqual(docs);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications/1/documents');
  });
});

describe('uploadDocument', () => {
  it('uploads file via FormData', async () => {
    const mockDoc = { id: 1, doc_type: 'proof_income', file_name: 'pay.pdf' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockDoc }),
    });

    const file = new File(['content'], 'pay.pdf', { type: 'application/pdf' });
    const result = await uploadDocument(1, file, 'proof_income');

    expect(result).toEqual(mockDoc);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/applications/1/documents'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws on upload failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'File too large' }),
    });

    const file = new File(['x'], 'big.pdf');
    await expect(uploadDocument(1, file, 'other')).rejects.toThrow('File too large');
  });

  it('throws generic error when no error field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const file = new File(['x'], 'f.pdf');
    await expect(uploadDocument(1, file, 'other')).rejects.toThrow('Upload failed');
  });
});

describe('deleteDocument', () => {
  it('deletes document', async () => {
    mockApiFetch.mockResolvedValue({ data: {}, headers: new Headers() });

    await deleteDocument(1, 5);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications/1/documents/5', {
      method: 'DELETE',
    });
  });
});
