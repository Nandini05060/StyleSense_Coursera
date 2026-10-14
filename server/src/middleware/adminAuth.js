/**
 * Admin-only authorization middleware
 * Verifies that the authenticated user possesses the 'admin' role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges are required to perform this action.'
    });
  }

  next();
}
