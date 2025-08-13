const mongoose = require('mongoose');

const feeAssignmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    validate: {
      validator: function(value) {
        return /^\d{4}-\d{2}$/.test(value);
      },
      message: 'Month must be in YYYY-MM format (e.g., 2024-01)'
    }
  },
  feeTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeType',
    required: [true, 'Fee type ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= 0 && Number.isFinite(value);
      },
      message: 'Amount must be a valid positive number'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'waived'],
      message: 'Status must be either pending, paid, or waived'
    },
    default: 'pending'
  }
}, {
  timestamps: true
});

// CRITICAL: Unique compound index to prevent duplicates
// This ensures no duplicate (studentId, month, feeTypeId) combinations
feeAssignmentSchema.index(
  { studentId: 1, month: 1, feeTypeId: 1 },
  { unique: true, name: 'unique_student_month_feetype' }
);

// Additional indexes for better query performance
feeAssignmentSchema.index({ month: 1 });
feeAssignmentSchema.index({ status: 1 });
feeAssignmentSchema.index({ studentId: 1, month: 1 });

module.exports = mongoose.model('FeeAssignment', feeAssignmentSchema);
