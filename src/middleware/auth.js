// src/middleware/auth.js
// Maps: Devise JWT authentication + app/controllers/api/v1/base_controller.rb
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import appConfig from '../config/app.js';
import { User, JwtDenylist } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: { code: 401, message: 'Authentication required' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, appConfig.jwt.secret, {
      algorithms: [appConfig.jwt.algorithm],
    });

    // Check if token is denylisted (maps: JTI revocation strategy)
    if (decoded.jti) {
      const isDenylisted = await JwtDenylist.isDenylisted(decoded.jti);
      if (isDenylisted) {
        return res.status(401).json({
          status: { code: 401, message: 'Token has been revoked' },
        });
      }
    }

    const user = await User.findByPk(decoded.sub);
    if (!user) {
      return res.status(401).json({
        status: { code: 401, message: 'User not found' },
      });
    }

    req.user = user;
    req.jwtPayload = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: { code: 401, message: 'Token has expired' },
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: { code: 401, message: 'Invalid token' },
      });
    }
    next(error);
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, appConfig.jwt.secret, {
      algorithms: [appConfig.jwt.algorithm],
    });

    const user = await User.findByPk(decoded.sub);
    if (user) {
      req.user = user;
      req.jwtPayload = decoded;
    }
  } catch {
    // Silently continue without auth
  }
  next();
};

export const generateToken = (user) => {
  const jti = crypto.randomUUID();
  const payload = {
    sub: user.id,
    jti,
    ...user.jwtPayload(),
  };
  const token = jwt.sign(payload, appConfig.jwt.secret, {
    algorithm: appConfig.jwt.algorithm,
    expiresIn: appConfig.jwt.expiration,
  });
  return { token, jti };
};

export default { authenticate, optionalAuth, generateToken };
