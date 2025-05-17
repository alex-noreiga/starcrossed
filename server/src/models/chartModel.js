const mongoose = require('mongoose');

// Comment schema
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Chart schema
const chartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: String,
    required: true
  },
  birthTime: {
    type: String,
    required: true
  },
  birthPlace: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  chartData: {
    type: Object,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: false
  },
  comments: [commentSchema],
  tags: [String],
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
chartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the Chart model
const Chart = mongoose.model('Chart', chartSchema);

module.exports = Chart;
