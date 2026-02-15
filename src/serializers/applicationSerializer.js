// src/serializers/applicationSerializer.js
// Maps: app/serializers/application_serializer.rb (JSONAPI format)

const serializeUser = (user) => {
  if (!user) return null;
  return { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email };
};

const serializeVehicle = (vehicle) => {
  if (!vehicle) return null;
  return { id: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year };
};

const serializeAddress = (addr) => ({
  id: addr.id,
  address_type: addr.address_type,
  street_address: addr.street_address,
  city: addr.city,
  state: addr.state,
  zip_code: addr.zip_code,
});

const serializeFinancialInfo = (fi) => ({
  id: fi.id,
  employment_status: fi.employment_status,
  annual_income: fi.annual_income,
});

const serializeDocument = (doc) => ({
  id: doc.id,
  doc_type: doc.doc_type,
  file_name: doc.file_name,
  status: doc.status,
});

export const serializeApplication = (app) => ({
  data: {
    id: app.id,
    type: 'application',
    attributes: {
      application_number: app.application_number,
      status: app.statusName(),
      current_step: app.current_step,
      loan_amount: app.loan_amount,
      down_payment: app.down_payment,
      loan_term: app.loan_term,
      interest_rate: app.interest_rate,
      monthly_payment: app.monthly_payment,
      dob: app.dob,
      rejection_reason: app.rejection_reason,
      submitted_at: app.submitted_at,
      decided_at: app.decided_at,
      signed_at: app.signed_at,
      agreement_accepted: app.agreement_accepted,
      created_at: app.created_at,
      updated_at: app.updated_at,
    },
    relationships: {
      user: serializeUser(app.user),
      vehicle: serializeVehicle(app.vehicle),
      addresses: app.addresses ? app.addresses.map(serializeAddress) : [],
      financial_infos: app.financialInfos ? app.financialInfos.map(serializeFinancialInfo) : [],
      documents: app.documents ? app.documents.map(serializeDocument) : [],
    },
  },
});

export const serializeApplicationList = (apps, meta) => ({
  data: apps.map((app) => serializeApplication(app).data),
  meta: { total: meta.total, page: meta.page, limit: meta.limit },
});

export default { serializeApplication, serializeApplicationList };
