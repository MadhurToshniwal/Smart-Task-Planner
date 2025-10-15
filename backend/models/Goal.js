const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['business', 'personal', 'project', 'learning', 'health', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  deadline: {
    type: Date
  },
  estimatedDuration: {
    type: Number, // in days
    min: 1,
    default: 7
  },
  budget: {
    type: Number,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'active'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  owner: {
    type: String,
    trim: true,
    default: 'Self'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  taskCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days remaining
GoalSchema.virtual('daysRemaining').get(function() {
  if (!this.deadline) return null;
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
GoalSchema.virtual('isOverdue').get(function() {
  return this.deadline && new Date() > this.deadline && this.status !== 'completed';
});

// Index for better performance
GoalSchema.index({ status: 1, priority: 1 });
GoalSchema.index({ deadline: 1 });

module.exports = mongoose.model('Goal', GoalSchema);