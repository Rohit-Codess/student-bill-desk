const mongoose = require('mongoose');

const feeTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee type name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Fee type name must be at least 2 characters long'],
    maxlength: [50, 'Fee type name cannot exceed 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: [0, 'Fee amount cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= 0 && Number.isFinite(value);
      },
      message: 'Fee amount must be a valid positive number'
    }
  },
  applicableClasses: {
    type: [String],
    required: [true, 'Applicable classes are required'],
    enum: {
      values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Graduate'],
      message: 'Class must be from 1 to 12 or Graduate'
    },
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'At least one class must be selected'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
feeTypeSchema.index({ name: 1 });

module.exports = mongoose.model('FeeType', feeTypeSchema);
