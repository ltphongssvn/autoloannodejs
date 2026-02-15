// src/controllers/applicationSign.js
// Maps: app/controllers/api/v1/applications_controller.rb#sign
import { Application, StatusHistory, sequelize } from '../models/index.js';

export const sign = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (req.user.roleName() === 'customer' && application.user_id !== req.user.id) {
      return res.status(403).json({ status: { code: 403, message: 'Forbidden' } });
    }
    if (!application.isApproved()) {
      return res.status(422).json({
        status: { code: 422, message: 'Only approved applications can be signed' },
      });
    }
    if (!req.body.agreement_accepted) {
      return res.status(422).json({
        status: { code: 422, message: 'Agreement must be accepted to sign' },
      });
    }

    await sequelize.transaction(async (transaction) => {
      const fromStatus = application.status;
      application.agreement_accepted = true;
      application.signed_at = new Date();
      application.status = Application.STATUSES.pending;
      await application.save({ transaction });

      await StatusHistory.create(
        {
          application_id: application.id,
          user_id: req.user.id,
          from_status: String(fromStatus),
          to_status: 'pending',
          comment: 'Agreement signed by customer',
        },
        { transaction },
      );
    });

    return res.status(200).json({
      status: { code: 200, message: 'Application signed successfully' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export default { sign };
