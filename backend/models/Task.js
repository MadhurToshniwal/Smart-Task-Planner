const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 1
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['planning', 'design', 'development', 'testing', 'deployment', 'marketing', 'other'],
    default: 'other'
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'blocked', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  assignee: {
    type: String,
    trim: true,
    default: 'Unassigned'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion percentage
TaskSchema.virtual('completionRate').get(function() {
  return this.status === 'completed' ? 100 : this.progress;
});

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  return this.endDate && new Date() > this.endDate && this.status !== 'completed';
});

// Index for better performance
TaskSchema.index({ goal: 1, status: 1 });
TaskSchema.index({ priority: 1, endDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);