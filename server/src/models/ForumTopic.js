const mongoose = require('mongoose');

// Forum topic schema
const forumTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorUsername: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumCategory',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lastPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  lastPostDate: {
    type: Date,
    default: Date.now
  },
  lastPostAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastPostAuthorUsername: String,
  tags: [String],
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
forumTopicSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the ForumTopic model
const ForumTopic = mongoose.model('ForumTopic', forumTopicSchema);

module.exports = ForumTopic;
