const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ev_platform_secret_2026';

/**
 * Authentication Middleware
 * 
 * Verifies the JWT token from the Authorization header.
 * Attaches the user payload (id, role) to the request object.
 * 
 * DESIGN DECISION: This middleware is additive. If a route is not 
 * wrapped with this, it remains publicly accessible (e.g., telemetry ingestion).
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Authentication required. No token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Invalid or expired session. Please login again.' 
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * 
 * Ensures the authenticated user has the required role for an action.
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize, JWT_SECRET };
