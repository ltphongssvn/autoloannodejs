// src/services/applicationCreation.js
// Maps: app/services/application_creation_service.rb
import crypto from 'crypto';
import { Application, sequelize } from '../models/index.js';
import { ValidationError } from '../utils/errors.js';

const generateApplicationNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AL-${date}-${suffix}`;
};

export const createApplication = async ({ userId, data = {} }) => {
  if (!userId) throw new ValidationError('User ID is required');

  return sequelize.transaction(async (transaction) => {
    const application = await Application.create(
      {
        user_id: userId,
        application_number: generateApplicationNumber(),
        status: Application.STATUSES.draft,
        current_step: 1,
        ...data,
      },
      { transaction },
    );

    return application;
  });
};

export default { createApplication };
