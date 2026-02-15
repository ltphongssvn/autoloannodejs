// src/__tests__/services/applicationCreation.test.js
import { jest } from '@jest/globals';

const mockCreate = jest.fn();
const mockFindByPk = jest.fn();

jest.unstable_mockModule('../../models/index.js', () => ({
  Application: { create: mockCreate, STATUSES: { draft: 0 } },
  User: { findByPk: mockFindByPk },
  sequelize: { transaction: jest.fn((fn) => fn({ afterCommit: jest.fn() })) },
}));

const { createApplication } = await import('../../services/applicationCreation.js');

describe('ApplicationCreation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a draft application', async () => {
    const mockApp = {
      id: 1,
      application_number: 'AL-20240101-ABC123',
      status: 0,
      user_id: 1,
      reload: jest.fn().mockResolvedValue(true),
    };
    mockCreate.mockResolvedValue(mockApp);

    const result = await createApplication({ userId: 1 });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 1, status: 0, current_step: 1 }),
      expect.any(Object),
    );
    expect(result).toBe(mockApp);
  });

  it('should generate unique application_number', async () => {
    const mockApp = { id: 1, reload: jest.fn().mockResolvedValue(true) };
    mockCreate.mockResolvedValue(mockApp);

    await createApplication({ userId: 1 });
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.application_number).toMatch(/^AL-\d{8}-[A-Z0-9]{6}$/);
  });

  it('should throw if userId is missing', async () => {
    await expect(createApplication({})).rejects.toThrow();
  });
});
