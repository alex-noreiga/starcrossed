const mongoose = require('mongoose');

// Forum category schema
const forumCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  topicCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  lastPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the ForumCategory model
const ForumCategory = mongoose.model('ForumCategory', forumCategorySchema);

module.exports = ForumCategory;
