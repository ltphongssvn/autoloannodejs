// src/controllers/applicationUpdate.js
// Maps: app/controllers/api/v1/applications_controller.rb#update
import { Application, Vehicle, Address, FinancialInfo, sequelize } from '../models/index.js';

const ALLOWED_FIELDS = ['loan_amount', 'down_payment', 'loan_term', 'dob', 'current_step'];

export const update = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (req.user.roleName() === 'customer' && application.user_id !== req.user.id) {
      return res.status(403).json({ status: { code: 403, message: 'Forbidden' } });
    }
    if (!application.isDraft()) {
      return res.status(422).json({
        status: { code: 422, message: 'Only draft applications can be updated' },
      });
    }

    await sequelize.transaction(async (transaction) => {
      ALLOWED_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) application[field] = req.body[field];
      });
      await application.save({ transaction });

      if (req.body.vehicle) {
        await Vehicle.upsert(
          { application_id: application.id, ...req.body.vehicle },
          { transaction },
        );
      }

      if (req.body.addresses) {
        await Address.destroy({ where: { application_id: application.id }, transaction });
        await Address.bulkCreate(
          req.body.addresses.map((a) => ({ ...a, application_id: application.id })),
          { transaction },
        );
      }

      if (req.body.financial_infos) {
        await FinancialInfo.destroy({ where: { application_id: application.id }, transaction });
        await FinancialInfo.bulkCreate(
          req.body.financial_infos.map((f) => ({ ...f, application_id: application.id })),
          { transaction },
        );
      }
    });

    return res.status(200).json({
      status: { code: 200, message: 'Application updated' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export default { update };
