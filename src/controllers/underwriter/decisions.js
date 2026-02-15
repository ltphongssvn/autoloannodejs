// src/controllers/underwriter/decisions.js
// Maps: app/controllers/api/v1/underwriter/applications_controller.rb
import { Application, StatusHistory, sequelize } from '../../models/index.js';

export const approve = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (!application.isUnderReview()) {
      return res.status(422).json({
        status: { code: 422, message: 'Only applications under review can be approved' },
      });
    }

    await sequelize.transaction(async (transaction) => {
      const fromStatus = application.status;
      application.status = Application.STATUSES.approved;
      application.decided_at = new Date();
      if (req.body.interest_rate) application.interest_rate = req.body.interest_rate;
      if (req.body.loan_term) application.loan_term = req.body.loan_term;
      await application.save({ transaction });

      await StatusHistory.create(
        {
          application_id: application.id,
          user_id: req.user.id,
          from_status: String(fromStatus),
          to_status: 'approved',
          comment: req.body.comment,
        },
        { transaction },
      );
    });

    return res.status(200).json({
      status: { code: 200, message: 'Application approved' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const rejectApp = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (!application.isUnderReview()) {
      return res.status(422).json({
        status: { code: 422, message: 'Only applications under review can be rejected' },
      });
    }
    if (!req.body.rejection_reason) {
      return res.status(422).json({
        status: { code: 422, message: 'Rejection reason is required' },
      });
    }

    await sequelize.transaction(async (transaction) => {
      const fromStatus = application.status;
      application.status = Application.STATUSES.rejected;
      application.decided_at = new Date();
      application.rejection_reason = req.body.rejection_reason;
      await application.save({ transaction });

      await StatusHistory.create(
        {
          application_id: application.id,
          user_id: req.user.id,
          from_status: String(fromStatus),
          to_status: 'rejected',
          comment: req.body.rejection_reason,
        },
        { transaction },
      );
    });

    return res.status(200).json({
      status: { code: 200, message: 'Application rejected' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export default { approve, rejectApp };
