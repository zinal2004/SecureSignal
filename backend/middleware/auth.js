const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Report = require('../models/Report');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-password');

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive admin account'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission} required`
      });
    }

    next();
  };
};

// Middleware to check if admin is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  next();
};

// Middleware to check if admin is at least admin level
const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!['admin', 'super_admin'].includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign(
    { adminId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify report access (for tracking reports)
const verifyReportAccess = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { email } = req.query;

    // For admin access, they can view any report
    if (req.admin) {
      return next();
    }

    // Find the report
    const report = await Report.findOne({ reportId });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // If anonymous, allow public access
    if (report.isAnonymous) {
      return next();
    }

    // If not anonymous, require email to match
    if (!email || report.reporterInfo.email !== email) {
      return res.status(400).json({
        success: false,
        message: 'Email required to track this report'
      });
    }

    next();
  } catch (error) {
    console.error('Report access verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying report access'
    });
  }
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireSuperAdmin,
  requireAdmin,
  generateToken,
  verifyReportAccess
}; 