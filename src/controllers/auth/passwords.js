// src/controllers/auth/passwords.js
// Maps: app/controllers/api/v1/auth/passwords_controller.rb
import { User, SecurityAuditLog } from '../../models/index.js';

export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(422).json({
        status: { code: 422, message: 'Current password and new password are required' },
      });
    }

    const user = await User.findByPk(req.user.id);
    const isValid = await user.validPassword(current_password);
    if (!isValid) {
      return res.status(401).json({
        status: { code: 401, message: 'Current password is incorrect' },
      });
    }

    if (new_password.length < 6) {
      return res.status(422).json({
        status: { code: 422, message: 'New password must be at least 6 characters' },
      });
    }

    user.encrypted_password = new_password;
    await user.save();

    await SecurityAuditLog.logEvent({
      userId: user.id,
      eventType: 'password_change',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.status(200).json({
      status: { code: 200, message: 'Password changed successfully' },
    });
  } catch (error) {
    next(error);
  }
};

export default { changePassword };
