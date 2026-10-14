import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { query } from '../config/db.js';

/**
 * Required authentication middleware
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.stylesense_token) {
      token = req.cookies.stylesense_token;
    }
    // 2. Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Fetch user from database to ensure not deleted or suspended
    const users = await query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid. Please log in again.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

/**
 * Optional authentication middleware for guest / logged-in dual support
 */
export async function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.cookies && req.cookies.stylesense_token) {
      token = req.cookies.stylesense_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const users = await query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (users && users.length > 0) {
        req.user = users[0];
      }
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
    req.user = null;
  }
  next();
}

export const authenticateToken = requireAuth;
