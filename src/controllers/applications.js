// src/controllers/applications.js
// Maps: app/controllers/api/v1/applications_controller.rb
import { Application, StatusHistory, sequelize } from '../models/index.js';
import { createApplication } from '../services/applicationCreation.js';

const INCLUDES = ['vehicle', 'addresses', 'financialInfos', 'documents'];

export const index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.user.roleName() === 'customer') where.user_id = req.user.id;
    if (req.query.status !== undefined) where.status = req.query.status;

    const { rows, count } = await Application.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: INCLUDES,
    });

    return res.status(200).json({
      data: rows.map((app) => ({ id: app.id, ...app.toJSON() })),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id, { include: INCLUDES });
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }

    if (req.user.roleName() === 'customer' && application.user_id !== req.user.id) {
      return res.status(403).json({ status: { code: 403, message: 'Forbidden' } });
    }

    return res.status(200).json({ data: application.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const application = await createApplication({ userId: req.user.id, data: req.body });
    return res.status(201).json({
      status: { code: 201, message: 'Application created' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const submit = async (req, res, next) => {
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
        status: { code: 422, message: 'Only draft applications can be submitted' },
      });
    }

    await sequelize.transaction(async (transaction) => {
      const fromStatus = application.status;
      application.status = Application.STATUSES.submitted;
      application.submitted_at = new Date();
      await application.save({ transaction });

      await StatusHistory.create(
        {
          application_id: application.id,
          user_id: req.user.id,
          from_status: String(fromStatus),
          to_status: 'submitted',
        },
        { transaction },
      );
    });

    return res.status(200).json({
      status: { code: 200, message: 'Application submitted' },
      data: application.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req, res, next) => {
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
        status: { code: 422, message: 'Only draft applications can be deleted' },
      });
    }

    await application.destroy();
    return res.status(200).json({ status: { code: 200, message: 'Application deleted' } });
  } catch (error) {
    next(error);
  }
};

export default { index, show, create, submit, destroy };
