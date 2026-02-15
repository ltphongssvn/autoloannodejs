// src/controllers/documents.js
// Maps: app/controllers/api/v1/documents_controller.rb
import { Document, Application } from '../models/index.js';

export const listByApplication = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (req.user.roleName() === 'customer' && application.user_id !== req.user.id) {
      return res.status(403).json({ status: { code: 403, message: 'Forbidden' } });
    }

    const documents = await Document.findAll({
      where: { application_id: application.id },
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json({ data: documents });
  } catch (error) {
    next(error);
  }
};

export const upload = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ status: { code: 404, message: 'Application not found' } });
    }
    if (req.user.roleName() === 'customer' && application.user_id !== req.user.id) {
      return res.status(403).json({ status: { code: 403, message: 'Forbidden' } });
    }

    const document = await Document.create({
      application_id: application.id,
      doc_type: req.body.doc_type || Document.DOC_TYPES.other,
      file_name: req.body.file_name || (req.file && req.file.originalname) || 'upload',
      file_url: req.file ? req.file.path : null,
      file_size: req.file ? req.file.size : null,
      content_type: req.file ? req.file.mimetype : null,
      status: Document.DOC_STATUSES.pending,
      uploaded_at: new Date(),
    });

    return res.status(201).json({
      status: { code: 201, message: 'Document uploaded' },
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ status: { code: 404, message: 'Document not found' } });
    }

    document.status = Document.DOC_STATUSES.verified;
    document.verified_at = new Date();
    document.verified_by_id = req.user.id;
    await document.save();

    return res.status(200).json({
      status: { code: 200, message: 'Document verified' },
      data: document.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const reject = async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ status: { code: 404, message: 'Document not found' } });
    }

    document.status = Document.DOC_STATUSES.rejected;
    document.rejection_note = req.body.rejection_note;
    await document.save();

    return res.status(200).json({
      status: { code: 200, message: 'Document rejected' },
      data: document.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export default { listByApplication, upload, verify, reject };
