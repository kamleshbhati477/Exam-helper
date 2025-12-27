const mongoose = require('mongoose');

// Rating subdocument schema
const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: {
      type: String,
      maxlength: 500
    },
    helpful: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Statistics subdocument schema
const statisticsSchema = new mongoose.Schema(
  {
    totalAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    highestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lowestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
      description: 'Total time spent on exam by all users (in seconds)'
    },
    averageTimePerAttempt: {
      type: Number,
      default: 0,
      description: 'Average time taken per attempt (in seconds)'
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: 'Percentage of users who completed the exam'
    },
    passRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: 'Percentage of users who passed the exam'
    }
  },
  { _id: false }
);

// Main Exam schema
const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an exam title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      minlength: [5, 'Title must be at least 5 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide exam description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Please specify exam category'],
      enum: ['Technology', 'Science', 'Mathematics', 'Language', 'Competitive', 'Professional', 'Other'],
      index: true
    },
    difficulty: {
      type: String,
      required: [true, 'Please specify difficulty level'],
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      index: true
    },
    duration: {
      type: Number,
      required: [true, 'Please provide exam duration'],
      description: 'Duration in minutes'
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Please provide total number of questions'],
      min: 1
    },
    passingScore: {
      type: Number,
      required: [true, 'Please provide passing score'],
      min: 0,
      max: 100,
      description: 'Percentage required to pass'
    },
    marksPerQuestion: {
      type: Number,
      required: [true, 'Please provide marks per question'],
      default: 1,
      min: 0
    },
    negativeMarking: {
      type: Number,
      default: 0,
      min: 0,
      description: 'Marks deducted for wrong answers'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Exam must have a creator'],
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private', 'Restricted'],
      default: 'Private',
      description: 'Public: Everyone can see, Private: Only creator, Restricted: Specific users'
    },
    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    startDate: {
      type: Date,
      description: 'When the exam becomes available'
    },
    endDate: {
      type: Date,
      description: 'When the exam is no longer available'
    },
    statistics: {
      type: statisticsSchema,
      default: {}
    },
    ratings: [ratingSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30
      }
    ],
    views: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 0
    },
    imageUrl: {
      type: String,
      description: 'URL of exam cover image'
    },
    instructions: {
      type: String,
      maxlength: 1000,
      description: 'Special instructions for exam takers'
    },
    negativeMarkingPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: 'Percentage of marks deducted for each wrong answer'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
examSchema.index({ createdBy: 1, isActive: 1 });
examSchema.index({ category: 1, difficulty: 1 });
examSchema.index({ isPublished: 1, visibility: 1 });
examSchema.index({ startDate: 1, endDate: 1 });
examSchema.index({ tags: 1 });
examSchema.index({ createdAt: -1 });
examSchema.index({ views: -1 });
examSchema.index({ attempts: -1 });
examSchema.index({ averageRating: -1 });

// Instance Methods

/**
 * Increment exam views
 */
examSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

/**
 * Increment exam attempts
 */
examSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

/**
 * Update statistics after an exam attempt
 * @param {Object} attemptData - Data from exam attempt {score, duration, passed}
 */
examSchema.methods.updateStatistics = function(attemptData) {
  const { score, duration, passed } = attemptData;

  // Update total attempts
  this.statistics.totalAttempts += 1;

  // Update highest score
  if (score > this.statistics.highestScore) {
    this.statistics.highestScore = score;
  }

  // Update lowest score (only if not first attempt)
  if (this.statistics.totalAttempts === 1) {
    this.statistics.lowestScore = score;
  } else if (score < this.statistics.lowestScore) {
    this.statistics.lowestScore = score;
  }

  // Update average score
  const previousTotal = (this.statistics.averageScore * (this.statistics.totalAttempts - 1)) || 0;
  this.statistics.averageScore = (previousTotal + score) / this.statistics.totalAttempts;

  // Update total time spent
  if (duration) {
    this.statistics.totalTimeSpent += duration;
    this.statistics.averageTimePerAttempt =
      this.statistics.totalTimeSpent / this.statistics.totalAttempts;
  }

  // Update pass rate
  if (passed !== undefined) {
    const previousPassed = Math.round(
      (this.statistics.passRate * (this.statistics.totalAttempts - 1)) / 100
    ) || 0;
    const newPassedCount = previousPassed + (passed ? 1 : 0);
    this.statistics.passRate = (newPassedCount / this.statistics.totalAttempts) * 100;
  }

  // Update completion rate (assuming all attempts are completions for now)
  this.statistics.completionRate = 100;

  return this.save();
};

/**
 * Add or update a rating for the exam
 * @param {String} userId - ID of the user rating
 * @param {Number} score - Rating score (1-5)
 * @param {String} review - Review text (optional)
 */
examSchema.methods.addRating = function(userId, score, review = '') {
  // Check if user already rated
  const existingRating = this.ratings.find(
    (rating) => rating.userId.toString() === userId.toString()
  );

  if (existingRating) {
    // Update existing rating
    existingRating.score = score;
    existingRating.review = review;
  } else {
    // Add new rating
    this.ratings.push({
      userId,
      score,
      review
    });
  }

  // Recalculate average rating
  if (this.ratings.length > 0) {
    const totalScore = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
    this.averageRating = totalScore / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }

  return this.save();
};

/**
 * Remove a rating from the exam
 * @param {String} userId - ID of the user whose rating to remove
 */
examSchema.methods.removeRating = function(userId) {
  this.ratings = this.ratings.filter((rating) => rating.userId.toString() !== userId.toString());

  // Recalculate average rating
  if (this.ratings.length > 0) {
    const totalScore = this.ratings.reduce((sum, rating) => sum + rating.score, 0);
    this.averageRating = totalScore / this.ratings.length;
    this.totalRatings = this.ratings.length;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }

  return this.save();
};

/**
 * Mark a rating as helpful
 * @param {String} ratingId - ID of the rating
 */
examSchema.methods.markRatingHelpful = function(ratingId) {
  const rating = this.ratings.find((r) => r._id.toString() === ratingId.toString());
  if (rating) {
    rating.helpful += 1;
    return this.save();
  }
  return Promise.resolve();
};

/**
 * Get exam summary with key information
 */
examSchema.methods.getExamSummary = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    difficulty: this.difficulty,
    duration: this.duration,
    totalQuestions: this.totalQuestions,
    passingScore: this.passingScore,
    marksPerQuestion: this.marksPerQuestion,
    createdBy: this.createdBy,
    isPublished: this.isPublished,
    views: this.views,
    attempts: this.attempts,
    averageRating: this.averageRating,
    totalRatings: this.totalRatings,
    statistics: {
      totalAttempts: this.statistics.totalAttempts,
      averageScore: this.statistics.averageScore.toFixed(2),
      highestScore: this.statistics.highestScore,
      lowestScore: this.statistics.lowestScore,
      passRate: this.statistics.passRate.toFixed(2),
      completionRate: this.statistics.completionRate.toFixed(2)
    },
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Check if exam is available (based on start/end dates)
 */
examSchema.methods.isAvailable = function() {
  const now = new Date();
  if (this.startDate && now < this.startDate) {
    return false;
  }
  if (this.endDate && now > this.endDate) {
    return false;
  }
  return this.isActive && this.isPublished;
};

/**
 * Check if a user has access to this exam
 * @param {String} userId - ID of the user
 */
examSchema.methods.canUserAccess = function(userId) {
  // Creator always has access
  if (this.createdBy.toString() === userId.toString()) {
    return true;
  }

  // Check visibility
  if (this.visibility === 'Public' && this.isPublished) {
    return true;
  }

  if (this.visibility === 'Private') {
    return false;
  }

  if (this.visibility === 'Restricted') {
    return this.allowedUsers.some((id) => id.toString() === userId.toString());
  }

  return false;
};

// Static Methods

/**
 * Find exams by category and difficulty
 */
examSchema.statics.findByCategoryAndDifficulty = function(category, difficulty) {
  return this.find({
    category,
    difficulty,
    isPublished: true,
    isActive: true
  });
};

/**
 * Find top-rated exams
 */
examSchema.statics.findTopRated = function(limit = 10) {
  return this.find({
    isPublished: true,
    isActive: true
  })
    .sort({ averageRating: -1 })
    .limit(limit);
};

/**
 * Find most attempted exams
 */
examSchema.statics.findMostAttempted = function(limit = 10) {
  return this.find({
    isPublished: true,
    isActive: true
  })
    .sort({ attempts: -1 })
    .limit(limit);
};

/**
 * Find exams by creator
 */
examSchema.statics.findByCreator = function(creatorId, includeUnpublished = false) {
  const query = { createdBy: creatorId };
  if (!includeUnpublished) {
    query.isPublished = true;
  }
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Search exams by title or tags
 */
examSchema.statics.searchExams = function(searchTerm, limit = 20) {
  return this.find({
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    isPublished: true,
    isActive: true
  })
    .limit(limit)
    .sort({ views: -1 });
};

// Middleware

// Update attempts before saving
examSchema.pre('save', function(next) {
  // Validate date logic
  if (this.startDate && this.endDate) {
    if (this.startDate > this.endDate) {
      return next(new Error('Start date cannot be after end date'));
    }
  }

  next();
});

module.exports = mongoose.model('Exam', examSchema);
