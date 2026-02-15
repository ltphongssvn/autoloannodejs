// src/controllers/users.js
// Maps: app/controllers/api/v1/users_controller.rb + profiles_controller.rb
import { User } from '../models/index.js';

const ALLOWED_PROFILE_FIELDS = ['first_name', 'last_name', 'phone'];

export const profile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ status: { code: 404, message: 'User not found' } });
    }
    const data = user.toJSON();
    delete data.encrypted_password;
    delete data.otp_secret;
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ status: { code: 404, message: 'User not found' } });
    }

    ALLOWED_PROFILE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });
    await user.save();

    const data = user.toJSON();
    delete data.encrypted_password;
    delete data.otp_secret;
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await User.findAndCountAll({
      attributes: { exclude: ['encrypted_password', 'otp_secret'] },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      data: rows.map((u) => u.toJSON()),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export default { profile, updateProfile, listUsers };
