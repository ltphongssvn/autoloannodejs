// src/__tests__/serializers/applicationSerializer.test.js

const { serializeApplication, serializeApplicationList } =
  await import('../../serializers/applicationSerializer.js');

describe('applicationSerializer', () => {
  const mockApp = {
    id: 1,
    application_number: 'AL-20240101-ABC123',
    status: 0,
    statusName: () => 'draft',
    current_step: 1,
    loan_amount: '25000.00',
    down_payment: '5000.00',
    loan_term: 60,
    interest_rate: '5.99',
    monthly_payment: '400.00',
    dob: '1990-01-15',
    rejection_reason: null,
    submitted_at: null,
    decided_at: null,
    signed_at: null,
    agreement_accepted: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
    vehicle: { id: 1, make: 'Toyota', model: 'Camry', year: 2024 },
    addresses: [
      {
        id: 1,
        address_type: 'residential',
        street_address: '123 Main St',
        city: 'LA',
        state: 'CA',
        zip_code: '90001',
      },
    ],
    financialInfos: [{ id: 1, employment_status: 'full_time', annual_income: '75000.00' }],
    documents: [{ id: 1, doc_type: 0, file_name: 'license.pdf', status: 0 }],
  };

  describe('serializeApplication', () => {
    it('should return JSONAPI-style structure', () => {
      const result = serializeApplication(mockApp);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(1);
      expect(result.data.type).toBe('application');
      expect(result.data.attributes).toBeDefined();
    });

    it('should include core attributes', () => {
      const { attributes } = serializeApplication(mockApp).data;
      expect(attributes.application_number).toBe('AL-20240101-ABC123');
      expect(attributes.status).toBe('draft');
      expect(attributes.current_step).toBe(1);
      expect(attributes.loan_amount).toBe('25000.00');
    });

    it('should include relationships when present', () => {
      const result = serializeApplication(mockApp);
      expect(result.data.relationships).toBeDefined();
      expect(result.data.relationships.user).toBeDefined();
      expect(result.data.relationships.vehicle).toBeDefined();
      expect(result.data.relationships.addresses).toBeDefined();
      expect(result.data.relationships.documents).toBeDefined();
    });

    it('should handle null relationships', () => {
      const appNoRels = {
        ...mockApp,
        user: null,
        vehicle: null,
        addresses: null,
        financialInfos: null,
        documents: null,
      };
      const result = serializeApplication(appNoRels);
      expect(result.data.relationships.user).toBeNull();
      expect(result.data.relationships.vehicle).toBeNull();
    });
  });

  describe('serializeApplicationList', () => {
    it('should serialize array with meta', () => {
      const result = serializeApplicationList([mockApp], { total: 1, page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should handle empty list', () => {
      const result = serializeApplicationList([], { total: 0, page: 1, limit: 20 });
      expect(result.data).toHaveLength(0);
    });
  });
});
