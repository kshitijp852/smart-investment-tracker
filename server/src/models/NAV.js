const mongoose = require('mongoose');

// Schema for storing NAV history
const NAVSchema = new mongoose.Schema({
  schemeCode: {
    type: String,
    required: true,
    index: true
  },
  schemeName: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  nav: {
    type: Number,
    required: true
  },
  repurchasePrice: {
    type: Number,
    default: null
  },
  salePrice: {
    type: Number,
    default: null
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
NAVSchema.index({ schemeCode: 1, date: -1 });
NAVSchema.index({ category: 1, date: -1 });

// Static method to get latest NAV for a scheme
NAVSchema.statics.getLatestNAV = async function(schemeCode) {
  return this.findOne({ schemeCode })
    .sort({ date: -1 })
    .limit(1);
};

// Static method to get NAV history for a scheme
NAVSchema.statics.getNAVHistory = async function(schemeCode, startDate, endDate) {
  const query = { schemeCode };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ date: -1 })
    .lean();
};

// Static method to get all schemes
NAVSchema.statics.getAllSchemes = async function() {
  return this.aggregate([
    {
      $sort: { date: -1 }
    },
    {
      $group: {
        _id: '$schemeCode',
        schemeName: { $first: '$schemeName' },
        category: { $first: '$category' },
        latestNAV: { $first: '$nav' },
        latestDate: { $first: '$date' }
      }
    },
    {
      $project: {
        _id: 0,
        schemeCode: '$_id',
        schemeName: 1,
        category: 1,
        latestNAV: 1,
        latestDate: 1
      }
    }
  ]);
};

module.exports = mongoose.model('NAV', NAVSchema);
