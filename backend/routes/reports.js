const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const { verifyReportAccess } = require('../middleware/auth');
const { upload, getFileUrl } = require('../utils/fileUpload');

const router = express.Router();

// Validation middleware
const validateReport = [
  body('title').isLength({ min: 5, max: 200 }).trim(),
  body('description').isLength({ min: 10, max: 2000 }).trim(),
  body('crimeType').isIn([
    'Theft', 'Assault', 'Vandalism', 'Drug Activity', 
    'Domestic Violence', 'Fraud', 'Cybercrime', 
    'Traffic Violation', 'Public Disturbance', 'Other', 'Fire'
  ]),
  body('location').custom((value) => {
    try {
      const location = JSON.parse(value);
      if (!location.address || location.address.length < 5) {
        throw new Error('Address is required and must be at least 5 characters');
      }
      return true;
    } catch (error) {
      throw new Error('Invalid location format');
    }
  }),
  body('dateTime').optional().isISO8601(),
  body('isAnonymous').optional().isBoolean(),
  body('reporterInfo').optional().custom((value) => {
    if (value) {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        throw new Error('Invalid reporter info format');
      }
    }
    return true;
  })
];

// @route   POST /api/reports
// @desc    Submit a new crime report with image uploads
// @access  Public
router.post('/', upload.fields([
  { name: 'images', maxCount: 5 }
]), validateReport, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Parse form data
    const {
      title,
      description,
      crimeType,
      location,
      dateTime,
      isAnonymous,
      reporterInfo
    } = req.body;

    // Parse JSON fields
    const locationData = JSON.parse(location);
    const isAnonymousBool = isAnonymous === 'true';
    const reporterInfoData = reporterInfo ? JSON.parse(reporterInfo) : {};

    // Process uploaded files
    const evidence = {
      images: [],
      documents: []
    };

    // Process images only
    if (req.files && req.files.images) {
      evidence.images = req.files.images.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: getFileUrl(file.filename, 'images'),
        size: file.size,
        mimetype: file.mimetype
      }));
    }

    // Create report data
    const reportData = {
      title,
      description,
      crimeType,
      location: {
        address: locationData.address,
        coordinates: locationData.coordinates || {},
        city: locationData.city || '',
        state: locationData.state || '',
        zipCode: locationData.zipCode || ''
      },
      dateTime: dateTime ? new Date(dateTime) : new Date(),
      evidence,
      isAnonymous: isAnonymousBool,
      reporterInfo: isAnonymousBool ? {} : reporterInfoData
    };

    // Generate AI analysis (simplified for now)
    const aiAnalysis = {
      summary: `AI Analysis: ${crimeType} incident reported at ${locationData.address}. Initial assessment indicates ${description.length > 100 ? 'detailed' : 'brief'} report requiring ${crimeType === 'Assault' || crimeType === 'Domestic Violence' ? 'urgent' : 'standard'} response.`,
      riskLevel: crimeType === 'Assault' || crimeType === 'Domestic Violence' ? 'High' : 'Medium',
      keywords: [crimeType.toLowerCase(), locationData.city?.toLowerCase()].filter(Boolean),
      sentiment: 'Neutral'
    };

    reportData.aiAnalysis = aiAnalysis;

    // Generate reportId manually as fallback
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    reportData.reportId = `SR-${timestamp}-${random}`;

    // Create the report
    const report = await Report.create(reportData);

    // Add initial update
    await report.addUpdate('Submitted', 'Report has been submitted and is under review');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report: {
        id: report.reportId,
        title: report.title,
        status: report.status,
        submittedAt: report.submittedAt,
        aiSummary: report.aiAnalysis.summary,
        evidenceCount: {
          images: evidence.images.length,
          documents: 0
        }
      }
    });

  } catch (error) {
    console.error('Report submission error:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB for images.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 images allowed.'
      });
    }
    
    if (error.message.includes('Only image files are allowed')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting report'
    });
  }
});

// @route   GET /api/reports/:reportId
// @desc    Get report by ID (for tracking)
// @access  Public (with email verification)
router.get('/:reportId', verifyReportAccess, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { email } = req.query;

    // Find the report
    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // For public access, verify email matches (if not anonymous)
    if (!req.admin && !report.isAnonymous) {
      if (!email || report.reporterInfo.email !== email) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Please provide the email used when submitting this report.'
        });
      }
    }

    // Prepare response data (filter sensitive information for public access)
    const reportData = {
      id: report.reportId,
      title: report.title,
      crimeType: report.crimeType,
      location: {
        address: report.location.address,
        city: report.location.city,
        state: report.location.state
      },
      dateTime: report.dateTime,
      status: report.status,
      priority: report.priority,
      submittedAt: report.submittedAt,
      lastUpdated: report.lastUpdated,
      aiSummary: report.aiAnalysis.summary,
      updates: report.updates
    };

    // Add description for admin access or if report is anonymous
    if (req.admin || report.isAnonymous) {
      reportData.description = report.description;
    }

    res.json({
      success: true,
      report: reportData
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving report'
    });
  }
});

// @route   PUT /api/reports/:reportId
// @desc    Update report status (admin only)
// @access  Private
router.put('/:reportId', async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { reportId } = req.params;
    const { status, message, adminNote } = req.body;

    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update status if provided
    if (status && status !== report.status) {
      await report.addUpdate(status, message || `Status updated to ${status}`);
      report.status = status;
    }

    // Add admin note if provided
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
        lastUpdated: report.lastUpdated
      }
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report'
    });
  }
});

// @route   GET /api/reports
// @desc    Get all reports (admin only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { 
      page = 1, 
      limit = 10, 
      status, 
      crimeType, 
      priority,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (crimeType) query.crimeType = crimeType;
    if (priority) query.priority = priority;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const reports = await Report.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-encryptionKey -reporterInfo');

    // Get total count
    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports'
    });
  }
});

// @route   DELETE /api/reports/:reportId
// @desc    Delete report (admin only)
// @access  Private
router.delete('/:reportId', async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { reportId } = req.params;

    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await Report.findByIdAndDelete(report._id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report'
    });
  }
});

module.exports = router; 