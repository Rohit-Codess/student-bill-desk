const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
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
