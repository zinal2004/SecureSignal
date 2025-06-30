const express = require('express');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const Report = require('../models/Report');
const { requirePermission, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateAdminUpdate = [
  body('firstName').optional().isLength({ min: 2, max: 50 }).trim(),
  body('lastName').optional().isLength({ min: 2, max: 50 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('department').optional().isLength({ max: 100 }).trim()
];

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private
router.get('/dashboard', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Submitted' });
    const inProgressReports = await Report.countDocuments({ status: 'In Progress' });
    const resolvedReports = await Report.countDocuments({ status: 'Resolved' });

    const crimeTypeStats = await Report.aggregate([
      { $group: { _id: '$crimeType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentReports = await Report.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('reportId title crimeType status submittedAt priority');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await Report.countDocuments({
      submittedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      dashboard: {
        overview: {
          totalReports,
          pendingReports,
          inProgressReports,
          resolvedReports,
          recentActivity
        },
        crimeTypeStats,
        recentReports
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard'
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Get reports with filtering (admin only)
// @access  Private
router.get('/reports', requirePermission('viewReports'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      crimeType,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (crimeType) query.crimeType = crimeType;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { reportId: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await Report.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-encryptionKey');

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports'
    });
  }
});

// @route   PUT /api/admin/reports/:reportId
// @desc    Update report status (admin only)
// @access  Private
router.put('/reports/:reportId', requirePermission('editReports'), async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, priority, adminNote } = req.body;

    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (status && status !== report.status) {
      await report.addUpdate(status, `Status updated to ${status} by admin`);
      report.status = status;
    }

    if (priority) {
      report.priority = priority;
    }

    if (adminNote) {
      await report.addAdminNote(adminNote, req.admin._id);
    }

    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      report: {
        id: report.reportId,
        status: report.status,
        priority: report.priority,
        lastUpdated: report.lastUpdated
      }
    });

  } catch (error) {
    console.error('Update admin report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report'
    });
  }
});

// @route   GET /api/admin/profile
// @desc    Get current admin profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        firstName: req.admin.firstName,
        lastName: req.admin.lastName,
        role: req.admin.role,
        permissions: req.admin.permissions,
        department: req.admin.department,
        phone: req.admin.phone,
        lastLogin: req.admin.lastLogin,
        isActive: req.admin.isActive
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile'
    });
  }
});

// @route   PUT /api/admin/profile
// @desc    Update current admin profile
// @access  Private
router.put('/profile', validateAdminUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const updateData = req.body;
    const allowedFields = ['firstName', 'lastName', 'phone', 'department'];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        req.admin[field] = updateData[field];
      }
    });

    await req.admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        firstName: req.admin.firstName,
        lastName: req.admin.lastName,
        role: req.admin.role,
        department: req.admin.department,
        phone: req.admin.phone
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

module.exports = router; 