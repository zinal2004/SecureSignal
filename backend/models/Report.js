const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: false,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  crimeType: {
    type: String,
    required: true,
    enum: [
      'Theft',
      'Assault',
      'Vandalism',
      'Drug Activity',
      'Domestic Violence',
      'Fraud',
      'Cybercrime',
      'Traffic Violation',
      'Public Disturbance',
      'Other',
      'Fire'
    ]
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    },
    city: String,
    state: String,
    zipCode: String
  },
  dateTime: {
    type: Date,
    default: Date.now
  },
  evidence: {
    images: [{
      filename: String,
      originalName: String,
      url: String,
      size: Number,
      mimetype: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  aiAnalysis: {
    summary: String,
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    keywords: [String],
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      default: 'Neutral'
    },
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  reporterInfo: {
    email: {
      type: String,
      sparse: true,
      index: true
    },
    phone: String,
    name: String
  },
  adminNotes: [{
    note: String,
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  updates: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isEncrypted: {
    type: Boolean,
    default: true
  },
  encryptionKey: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ crimeType: 1, status: 1 });
reportSchema.index({ submittedAt: -1 });
reportSchema.index({ priority: 1, status: 1 });

// Pre-save middleware to generate report ID
reportSchema.pre('save', function(next) {
  // Always generate a report ID if it doesn't exist
  if (!this.reportId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.reportId = `SR-${timestamp}-${random}`;
  }
  
  this.lastUpdated = new Date();
  next();
});

// Post-save middleware to ensure reportId is set
reportSchema.post('save', function(doc) {
  if (!doc.reportId) {
    console.error('Report saved without reportId:', doc._id);
  }
});

// Virtual for formatted date
reportSchema.virtual('formattedDate').get(function() {
  return this.dateTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to add update
reportSchema.methods.addUpdate = function(status, message) {
  this.updates.push({ status, message });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to add admin note
reportSchema.methods.addAdminNote = function(note, adminId) {
  this.adminNotes.push({ note, adminId });
  return this.save();
};

// Static method to get reports by status
reportSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ submittedAt: -1 });
};

// Static method to get reports by crime type
reportSchema.statics.getByCrimeType = function(crimeType) {
  return this.find({ crimeType }).sort({ submittedAt: -1 });
};

module.exports = mongoose.model('Report', reportSchema); 