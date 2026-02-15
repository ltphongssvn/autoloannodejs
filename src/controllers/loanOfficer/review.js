// src/controllers/loanOfficer/review.js
// Maps: app/controllers/api/v1/loan_officer/applications_controller.rb
import { Application, StatusHistory, ApplicationNote, sequelize } from '../../models/index.js';

export const startReview = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (!application.isSubmitted()) {
      return res.status(422).json({
        status: { code: 422, message: 'Only submitted applications can be reviewed' },
      });
    }

    await sequelize.transaction(async (transaction) => {
      const fromStatus = application.status;
      application.status = Application.STATUSES.under_review;
      await application.save({ transaction });

      await StatusHistory.create(
        {
          application_id: application.id,
          user_id: req.user.id,
          from_status: String(fromStatus),
          to_status: 'under_review',
        },
        { transaction },
      );
    });

    return res.status(200).json({
      status: { code: 200, message: 'Review started' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const requestDocuments = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (!application.isUnderReview()) {
      return res.status(422).json({
        status: { code: 422, message: 'Only applications under review can request documents' },
      });
    }

    await sequelize.transaction(async (transaction) => {
      const fromStatus = application.status;
      application.status = Application.STATUSES.pending_documents;
      await application.save({ transaction });

      await StatusHistory.create(
        {
          application_id: application.id,
          user_id: req.user.id,
          from_status: String(fromStatus),
          to_status: 'pending_documents',
          comment: req.body.note,
        },
        { transaction },
      );
    });

    return res.status(200).json({
      status: { code: 200, message: 'Documents requested' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (!req.body.note) {
      return res.status(422).json({ status: { code: 422, message: 'Note is required' } });
    }

    const note = await ApplicationNote.create({
      application_id: application.id,
      user_id: req.user.id,
      note: req.body.note,
      internal: req.body.internal || false,
    });

    return res.status(201).json({
      status: { code: 201, message: 'Note added' },
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export default { startReview, requestDocuments, addNote };
