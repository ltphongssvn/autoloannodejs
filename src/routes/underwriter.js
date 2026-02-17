// src/routes/underwriter.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireUnderwriter } from '../middleware/authorize.js';
import { Application } from '../models/index.js';
import { approve, rejectApp } from '../controllers/underwriter/decisions.js';

const INCLUDES = ['vehicle', 'addresses', 'financialInfos', 'documents'];

const router = Router();
router.use(authenticate, requireUnderwriter);

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;
    const { rows, count } = await Application.findAndCountAll({
      where: { status: ['under_review'] },
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
});

router.get('/:id', async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id, { include: INCLUDES });
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    return res.status(200).json({ data: application.toJSON() });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/approve', approve);
router.post('/:id/reject', rejectApp);

export default router;
