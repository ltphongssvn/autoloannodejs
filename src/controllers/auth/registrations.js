// src/controllers/auth/registrations.js
// Maps: app/controllers/api/v1/auth/registrations_controller.rb
import { User, SecurityAuditLog } from '../../models/index.js';
import { generateToken } from '../../middleware/auth.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(422).json({
        status: { code: 422, message: 'Email, password, first name, and last name are required' },
      });
    }

    if (password.length < 6) {
      return res.status(422).json({
        status: { code: 422, message: 'Password must be at least 6 characters' },
      });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({
        status: { code: 409, message: 'Email already registered' },
      });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      encrypted_password: password,
      first_name,
      last_name,
      phone,
      role: 0,
    });

    const { token } = generateToken(user);
    res.setHeader('Authorization', `Bearer ${token}`);

    await SecurityAuditLog.logEvent({
      userId: user.id,
      eventType: 'login_success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { method: 'registration' },
    });

    return res.status(201).json({
      status: { code: 201, message: 'Signed up successfully.' },
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.roleName(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { register };
