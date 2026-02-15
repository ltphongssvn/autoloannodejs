// frontend/src/services/applications.test.ts
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  submitApplication,
  signApplication,
  deleteApplication,
} from './applications';
import { apiFetch } from './api';

jest.mock('./api', () => ({
  apiFetch: jest.fn(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => {
  jest.clearAllMocks();
});

const mockApp = {
  id: 1,
  application_number: 'AL-001',
  status: 'draft',
  current_step: 1,
};

describe('getApplications', () => {
  it('fetches all applications', async () => {
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: [mockApp] },
      headers: new Headers(),
    });

    const result = await getApplications();
    expect(result).toEqual([mockApp]);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications');
  });
});

describe('getApplication', () => {
  it('fetches single application by id', async () => {
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: mockApp },
      headers: new Headers(),
    });

    const result = await getApplication(1);
    expect(result).toEqual(mockApp);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications/1');
  });
});

describe('createApplication', () => {
  it('creates and returns new application', async () => {
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 201 }, data: mockApp },
      headers: new Headers(),
    });

    const result = await createApplication({ current_step: 1 });
    expect(result).toEqual(mockApp);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications', {
      method: 'POST',
      body: JSON.stringify({ application: { current_step: 1 } }),
    });
  });
});

describe('updateApplication', () => {
  it('updates and returns application', async () => {
    const updated = { ...mockApp, current_step: 2 };
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: updated },
      headers: new Headers(),
    });

    const result = await updateApplication(1, { current_step: 2 });
    expect(result).toEqual(updated);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ application: { current_step: 2 } }),
    });
  });
});

describe('submitApplication', () => {
  it('submits application by id', async () => {
    const submitted = { ...mockApp, status: 'submitted' };
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: submitted },
      headers: new Headers(),
    });

    const result = await submitApplication(1);
    expect(result).toEqual(submitted);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications/1/submit', {
      method: 'POST',
    });
  });
});

describe('signApplication', () => {
  it('signs application with signature data', async () => {
    const signed = { ...mockApp, status: 'pending', signature_data: 'sig' };
    mockApiFetch.mockResolvedValue({
      data: { status: { code: 200 }, data: signed },
      headers: new Headers(),
    });

    const result = await signApplication(1, 'sig');
    expect(result).toEqual(signed);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications/1/sign', {
      method: 'POST',
      body: JSON.stringify({ signature_data: 'sig' }),
    });
  });
});

describe('deleteApplication', () => {
  it('deletes application by id', async () => {
    mockApiFetch.mockResolvedValue({
      data: {},
      headers: new Headers(),
    });

    await deleteApplication(1);
    expect(mockApiFetch).toHaveBeenCalledWith('/applications/1', {
      method: 'DELETE',
    });
  });
});
