const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

/**
 * User Schema with authentication and profile management
 */
const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'Please provide your first name'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide your last name'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true,
    },
    phone: {
      type: String,
      validate: [
        function(v) {
          return !v || validator.isMobilePhone(v);
        },
        'Please provide a valid phone number',
      ],
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },

    // Authentication
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
      validate: {
        validator: function(v) {
          // Password must contain at least one uppercase, one lowercase, and one number
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(v);
        },
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Profile Management
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },
    education: {
      institution: {
        type: String,
        maxlength: [100, 'Institution name cannot exceed 100 characters'],
        default: null,
      },
      degree: {
        type: String,
        maxlength: [100, 'Degree cannot exceed 100 characters'],
        default: null,
      },
      field: {
        type: String,
        maxlength: [100, 'Field of study cannot exceed 100 characters'],
        default: null,
      },
      graduationYear: {
        type: Number,
        default: null,
      },
    },
    interests: {
      type: [String],
      default: [],
      maxlength: [20, 'Maximum 20 interests allowed'],
    },
    location: {
      city: {
        type: String,
        maxlength: [50, 'City cannot exceed 50 characters'],
        default: null,
      },
      state: {
        type: String,
        maxlength: [50, 'State cannot exceed 50 characters'],
        default: null,
      },
      country: {
        type: String,
        maxlength: [50, 'Country cannot exceed 50 characters'],
        default: null,
      },
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,

    // Preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        enum: ['en', 'hi', 'es', 'fr', 'de'],
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },

    // Statistics
    statistics: {
      totalExamsTaken: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      totalStudyHours: {
        type: Number,
        default: 0,
      },
      streak: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: Date,
        default: null,
      },
    },

    // Social Links
    socialLinks: {
      linkedin: {
        type: String,
        default: null,
      },
      github: {
        type: String,
        default: null,
      },
      twitter: {
        type: String,
        default: null,
      },
      website: {
        type: String,
        default: null,
      },
    },

    // Two-Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,

    // Account Metadata
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field: Full Name
 */
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Update passwordChangedAt if not a new user
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare password with hashed password
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate JWT Token
 */
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
  return token;
};

/**
 * Generate Password Reset Token
 */
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash and set to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

/**
 * Generate Email Verification Token
 */
userSchema.methods.generateVerificationToken = function() {
  const crypto = require('crypto');

  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expiration time (24 hours)
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

/**
 * Check if password has been changed after JWT was issued
 */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Update user statistics
 */
userSchema.methods.updateStatistics = function(examScore, examDuration = 0) {
  const totalExams = this.statistics.totalExamsTaken + 1;
  const currentAverage = this.statistics.averageScore;

  // Calculate new average
  const newAverage =
    (currentAverage * (totalExams - 1) + examScore) / totalExams;

  this.statistics.totalExamsTaken = totalExams;
  this.statistics.averageScore = Math.round(newAverage);
  this.statistics.totalStudyHours += examDuration / 60; // Convert minutes to hours
  this.statistics.lastActiveDate = new Date();

  return this.save();
};

/**
 * Update last login timestamp
 */
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

/**
 * Increment login attempts
 */
userSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account after 5 attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2; // hours

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + lockTime * 60 * 60 * 1000,
    };
  }

  return this.updateOne(updates);
};

/**
 * Check if account is locked
 */
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > new Date();
};

/**
 * Update user profile information
 */
userSchema.methods.updateProfile = async function(updateData) {
  const allowedFields = [
    'firstName',
    'lastName',
    'phone',
    'avatar',
    'bio',
    'interests',
  ];
  const allowedNestedFields = {
    education: ['institution', 'degree', 'field', 'graduationYear'],
    location: ['city', 'state', 'country'],
    preferences: ['emailNotifications', 'darkMode', 'language', 'timezone'],
    socialLinks: ['linkedin', 'github', 'twitter', 'website'],
  };

  // Update allowed fields
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      this[field] = updateData[field];
    }
  }

  // Update nested objects
  for (const [nestedField, subFields] of Object.entries(allowedNestedFields)) {
    if (updateData[nestedField]) {
      for (const subField of subFields) {
        if (updateData[nestedField][subField] !== undefined) {
          this[nestedField][subField] = updateData[nestedField][subField];
        }
      }
    }
  }

  return this.save();
};

/**
 * Get public profile (without sensitive data)
 */
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();

  // Remove sensitive fields
  delete userObj.password;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.verificationToken;
  delete userObj.verificationTokenExpires;
  delete userObj.twoFactorSecret;
  delete userObj.loginAttempts;
  delete userObj.lockUntil;

  return userObj;
};

/**
 * Index for performance optimization
 */
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'statistics.lastActiveDate': -1 });

/**
 * Create and export User model
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
