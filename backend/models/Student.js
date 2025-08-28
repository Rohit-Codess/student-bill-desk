const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
    minlength: [2, 'Father name must be at least 2 characters long'],
    maxlength: [100, 'Father name cannot exceed 100 characters']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    }
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: {
      values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Graduate'],
      message: 'Class must be from 1 to 12 or Graduate'
    }
  },
  mobileNumber: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    default: ''
  },
  address: {
    type: String,
    trim: true,
    minlength: [10, 'Address must be at least 10 characters long'],
    maxlength: [500, 'Address cannot exceed 500 characters'],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
studentSchema.index({ isActive: 1 });
studentSchema.index({ name: 1 });
studentSchema.index({ fatherName: 1 });
studentSchema.index({ mobileNumber: 1 });
studentSchema.index({ class: 1 });

// Pre-delete middleware to cascade delete related fee assignments
studentSchema.pre('findOneAndDelete', async function() {
  try {
    const studentId = this.getQuery()['_id'];
    console.log(`Pre-delete middleware: Deleting fee assignments for student ${studentId}`);
    
    // Import FeeAssignment model
    const FeeAssignment = mongoose.model('FeeAssignment');
    
    // Delete all fee assignments for this student
    const result = await FeeAssignment.deleteMany({ studentId: studentId });
    console.log(`Pre-delete middleware: Deleted ${result.deletedCount} fee assignments`);
  } catch (error) {
    console.error('Error in pre-delete middleware:', error);
  }
});

// Also handle deleteOne method
studentSchema.pre('deleteOne', async function() {
  try {
    const studentId = this.getQuery()['_id'];
    console.log(`Pre-deleteOne middleware: Deleting fee assignments for student ${studentId}`);
    
    // Import FeeAssignment model
    const FeeAssignment = mongoose.model('FeeAssignment');
    
    // Delete all fee assignments for this student
    const result = await FeeAssignment.deleteMany({ studentId: studentId });
    console.log(`Pre-deleteOne middleware: Deleted ${result.deletedCount} fee assignments`);
  } catch (error) {
    console.error('Error in pre-deleteOne middleware:', error);
  }
});

module.exports = mongoose.model('Student', studentSchema);
