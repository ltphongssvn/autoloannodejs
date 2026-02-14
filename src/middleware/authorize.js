// src/middleware/authorize.js
// Maps: app/policies/loan_application_policy.rb + Pundit authorization
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: { code: 401, message: 'Authentication required' },
      });
    }

    const roleName = req.user.roleName();
    if (!roles.includes(roleName)) {
      return res.status(403).json({
        error: {
          code: 'Forbidden',
          message: 'You are not authorized to perform this action.',
          innererror: { code: 'InsufficientRole', timestamp: new Date().toISOString() },
        },
      });
    }
    next();
  };
};

export const requireCustomer = requireRole('customer');
export const requireLoanOfficer = requireRole('loan_officer');
export const requireUnderwriter = requireRole('underwriter');
export const requireStaff = requireRole('loan_officer', 'underwriter');

// Application-level policies (maps: LoanApplicationPolicy)
export const authorizeApplication = (action) => {
  return (req, res, next) => {
    const user = req.user;
    const application = req.application;
    const role = user.roleName();
    const isOwner = application && application.user_id === user.id;

    let authorized = false;

    switch (action) {
      case 'show':
        authorized = isOwner || role === 'loan_officer' || role === 'underwriter';
        break;
      case 'create':
        authorized = role === 'customer';
        break;
      case 'update':
        if (role === 'customer') {
          authorized = isOwner && (application.isDraft() || application.isPendingDocuments());
        } else {
          authorized = role === 'loan_officer' || role === 'underwriter';
        }
        break;
      case 'destroy':
        authorized = role === 'customer' && isOwner && application.isDraft();
        break;
      case 'submit':
        authorized = role === 'customer' && isOwner && application.isDraft();
        break;
      case 'sign':
        authorized = role === 'customer' && isOwner && application.isApproved();
        break;
      case 'review':
        authorized = role === 'loan_officer' || role === 'underwriter';
        break;
      case 'approve':
      case 'reject':
        authorized = role === 'underwriter';
        break;
      default:
        authorized = false;
    }

    if (!authorized) {
      return res.status(403).json({
        error: {
          code: 'Forbidden',
          message: 'You are not authorized to perform this action.',
          innererror: {
            code: 'PolicyViolation',
            action,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
    next();
  };
};

export const requireScope = (scope) => {
  return (req, res, next) => {
    const tokenScopes = req.jwtPayload?.scopes || [];
    if (!tokenScopes.includes(scope)) {
      return res.status(403).json({
        error: {
          code: 'Forbidden',
          message: 'Insufficient scope for this action.',
          innererror: {
            code: 'InsufficientScope',
            required: scope,
            available: tokenScopes,
          },
        },
      });
    }
    next();
  };
};

export default {
  requireRole,
  requireCustomer,
  requireLoanOfficer,
  requireUnderwriter,
  requireStaff,
  authorizeApplication,
  requireScope,
};
