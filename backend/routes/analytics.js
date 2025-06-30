const express = require('express');
const Report = require('../models/Report');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview
// @access  Private
router.get('/overview', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total reports in period
    const totalReports = await Report.countDocuments({
      submittedAt: { $gte: startDate }
    });

    // Reports by status
    const statusBreakdown = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reports by crime type
    const crimeTypeBreakdown = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$crimeType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Reports by priority
    const priorityBreakdown = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily reports for the period
    const dailyReports = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$submittedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Average response time (time from submitted to first status change)
    const responseTimeData = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate },
          'updates.1': { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: [
              { $arrayElemAt: ['$updates.timestamp', 1] },
              '$submittedAt'
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        period: `${days} days`,
        overview: {
          totalReports,
          avgDailyReports: Math.round(totalReports / days * 10) / 10
        },
        statusBreakdown,
        crimeTypeBreakdown,
        priorityBreakdown,
        dailyReports,
        responseTime: responseTimeData[0] || {
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0
        }
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading analytics'
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get trend analysis
// @access  Private
router.get('/trends', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { months = '6' } = req.query;
    const monthCount = parseInt(months);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthCount);

    // Monthly trends
    const monthlyTrends = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          count: { $sum: 1 },
          crimeTypes: { $addToSet: '$crimeType' },
          avgPriority: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'Low'] }, then: 1 },
                  { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'High'] }, then: 3 },
                  { case: { $eq: ['$priority', 'Urgent'] }, then: 4 }
                ],
                default: 2
              }
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Crime type trends
    const crimeTypeTrends = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            crimeType: '$crimeType',
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.crimeType': 1 }
      }
    ]);

    // Location-based trends
    const locationTrends = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate },
          'location.city': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          crimeTypes: { $addToSet: '$crimeType' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      trends: {
        period: `${months} months`,
        monthlyTrends,
        crimeTypeTrends,
        locationTrends
      }
    });

  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading trends'
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance metrics
// @access  Private
router.get('/performance', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Response time metrics
    const responseTimeMetrics = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate },
          'updates.1': { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: [
              { $arrayElemAt: ['$updates.timestamp', 1] },
              '$submittedAt'
            ]
          },
          resolutionTime: {
            $subtract: [
              { $cond: [
                { $in: ['$status', ['Resolved', 'Closed']] },
                '$lastUpdated',
                null
              ]},
              '$submittedAt'
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);

    // Resolution rate
    const resolutionMetrics = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Admin performance (if admin tracking is implemented)
    const adminPerformance = await Report.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate },
          'adminNotes.adminId': { $exists: true }
        }
      },
      {
        $unwind: '$adminNotes'
      },
      {
        $group: {
          _id: '$adminNotes.adminId',
          reportsHandled: { $sum: 1 },
          avgResponseTime: {
            $avg: {
              $subtract: ['$adminNotes.createdAt', '$submittedAt']
            }
          }
        }
      },
      {
        $sort: { reportsHandled: -1 }
      }
    ]);

    res.json({
      success: true,
      performance: {
        period: `${days} days`,
        responseTime: responseTimeMetrics[0] || {
          avgResponseTime: 0,
          avgResolutionTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0
        },
        resolutionMetrics,
        adminPerformance
      }
    });

  } catch (error) {
    console.error('Analytics performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading performance metrics'
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', requirePermission('exportData'), async (req, res) => {
  try {
    const { format = 'json', period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get reports for export
    const reports = await Report.find({
      submittedAt: { $gte: startDate }
    }).select('-encryptionKey -reporterInfo');

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = reports.map(report => ({
        'Report ID': report.reportId,
        'Title': report.title,
        'Crime Type': report.crimeType,
        'Status': report.status,
        'Priority': report.priority,
        'Location': report.location.address,
        'Submitted Date': report.submittedAt,
        'Last Updated': report.lastUpdated
      }));

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reports-${period}days.csv`);

      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      // Return JSON
      res.json({
        success: true,
        export: {
          period: `${days} days`,
          totalReports: reports.length,
          data: reports
        }
      });
    }

  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

// @route   GET /api/analytics/realtime
// @desc    Get real-time analytics
// @access  Private
router.get('/realtime', requirePermission('viewAnalytics'), async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Reports in last hour
    const lastHourReports = await Report.countDocuments({
      submittedAt: { $gte: oneHourAgo }
    });

    // Reports in last 24 hours
    const lastDayReports = await Report.countDocuments({
      submittedAt: { $gte: oneDayAgo }
    });

    // Recent activity (last 10 reports)
    const recentActivity = await Report.find()
      .sort({ submittedAt: -1 })
      .limit(10)
      .select('reportId title crimeType status submittedAt priority');

    // Pending reports count
    const pendingReports = await Report.countDocuments({
      status: 'Submitted'
    });

    // High priority reports
    const highPriorityReports = await Report.countDocuments({
      priority: { $in: ['High', 'Urgent'] },
      status: { $ne: 'Resolved' }
    });

    res.json({
      success: true,
      realtime: {
        lastHourReports,
        lastDayReports,
        pendingReports,
        highPriorityReports,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading real-time data'
    });
  }
});

module.exports = router; 