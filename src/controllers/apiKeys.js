// src/controllers/apiKeys.js
// Maps: app/controllers/api/v1/api_keys_controller.rb
import { ApiKey } from '../models/index.js';

export const listKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.findAll({
      where: { user_id: req.user.id, active: true },
      attributes: { exclude: ['key_digest'] },
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json({ data: keys });
  } catch (error) {
    next(error);
  }
};

export const createKey = async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(422).json({ status: { code: 422, message: 'Name is required' } });
    }

    const rawKey = ApiKey.generateKey();
    const keyDigest = ApiKey.digestKey(rawKey);

    const apiKey = await ApiKey.create({
      user_id: req.user.id,
      name: req.body.name,
      key_digest: keyDigest,
      expires_at: req.body.expires_at || null,
    });

    return res.status(201).json({
      status: {
        code: 201,
        message: 'API key created. Save the raw key — it cannot be shown again.',
      },
      data: { ...apiKey.toJSON(), raw_key: rawKey },
    });
  } catch (error) {
    next(error);
  }
};

export const revokeKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKey.findByPk(req.params.id);
    if (!apiKey) {
      return res.status(404).json({ status: { code: 404, message: 'API key not found' } });
    }
    if (apiKey.user_id !== req.user.id) {
      return res.status(403).json({ status: { code: 403, message: 'Forbidden' } });
    }

    await apiKey.revoke();
    return res.status(200).json({ status: { code: 200, message: 'API key revoked' } });
  } catch (error) {
    next(error);
  }
};

export default { listKeys, createKey, revokeKey };
