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
  }
}, {
  timestamps: true
});

// Index for better query performance
feeTypeSchema.index({ name: 1 });

module.exports = mongoose.model('FeeType', feeTypeSchema);
