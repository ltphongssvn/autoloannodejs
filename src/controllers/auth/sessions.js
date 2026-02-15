// src/controllers/auth/sessions.js
// Maps: app/controllers/api/v1/auth/sessions_controller.rb
import { User, SecurityAuditLog, JwtDenylist } from '../../models/index.js';
import { generateToken } from '../../middleware/auth.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        status: { code: 422, message: 'Email and password are required' },
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      await SecurityAuditLog.logEvent({
        eventType: 'login_failure',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { email, reason: 'user_not_found' },
        success: false,
      });
      return res.status(401).json({
        status: { code: 401, message: 'Invalid email or password' },
      });
    }

    if (user.locked_at) {
      return res.status(423).json({
        status: { code: 423, message: 'Account is locked. Please contact support.' },
      });
    }

    const validPassword = await user.validPassword(password);
    if (!validPassword) {
      await SecurityAuditLog.logEvent({
        userId: user.id,
        eventType: 'login_failure',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { reason: 'invalid_password' },
        success: false,
      });
      return res.status(401).json({
        status: { code: 401, message: 'Invalid email or password' },
      });
    }

    // Update trackable fields
    user.last_sign_in_at = user.current_sign_in_at;
    user.last_sign_in_ip = user.current_sign_in_ip;
    user.current_sign_in_at = new Date();
    user.current_sign_in_ip = req.ip;
    user.sign_in_count = (user.sign_in_count || 0) + 1;
    await user.save();

    const { token } = generateToken(user);
    res.setHeader('Authorization', `Bearer ${token}`);

    await SecurityAuditLog.logEvent({
      userId: user.id,
      eventType: 'login_success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.status(200).json({
      status: { code: 200, message: 'Logged in successfully.' },
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

export const logout = async (req, res, next) => {
  try {
    const { jti, exp } = req.jwtPayload;
    await JwtDenylist.addToList(jti, exp);

    await SecurityAuditLog.logEvent({
      userId: req.user.id,
      eventType: 'logout',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return res.status(200).json({
      status: { code: 200, message: 'Logged out successfully.' },
    });
  } catch (error) {
    next(error);
  }
};

export default { login, logout };
