const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Social link schema for user profiles
const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['twitter', 'instagram', 'facebook', 'linkedin', 'website', 'youtube', 'tiktok']
  },
  url: {
    type: String,
    required: true
  }
});

// User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  professionalTitle: {
    type: String,
    maxlength: 100
  },
  location: {
    type: String,
    maxlength: 100
  },
  profileImage: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  socialLinks: [socialLinkSchema],
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date,
  role: {
    type: String,
    enum: ['user', 'astrologer', 'admin'],
    default: 'user'
  },
  socialLogins: [{
    provider: String,
    providerId: String
  }],
  preferences: {
    houseSystem: {
      type: String,
      enum: ['placidus', 'koch', 'whole-sign', 'equal'],
      default: 'placidus'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set token expiry (1 hour)
  this.resetPasswordTokenExpires = Date.now() + 3600000;
  
  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Set token
  this.verificationToken = verificationToken;
  
  // Set token expiry (24 hours)
  this.verificationTokenExpires = Date.now() + 86400000;
  
  return verificationToken;
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
