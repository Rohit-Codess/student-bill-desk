// Migration script to update existing students with new required fields
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-bill-desk')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const studentSchema = new mongoose.Schema({
  name: String,
  fatherName: String,
  gender: String,
  class: String,
  mobileNumber: String,
  address: String,
  isActive: Boolean
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

async function migrateStudents() {
  try {
    console.log('Starting student migration...');
    
    // Find all students that don't have the new fields
    const studentsToUpdate = await Student.find({
      $or: [
        { fatherName: { $exists: false } },
        { gender: { $exists: false } },
        { class: { $exists: false } },
        { mobileNumber: { $exists: false } },
        { address: { $exists: false } }
      ]
    });

    console.log(`Found ${studentsToUpdate.length} students to migrate`);

    if (studentsToUpdate.length === 0) {
      console.log('No students need migration');
      return;
    }

    // Update each student with default values
    for (const student of studentsToUpdate) {
      await Student.updateOne(
        { _id: student._id },
        {
          $set: {
            fatherName: student.fatherName || 'Not Provided',
            gender: student.gender || 'Male',
            class: student.class || '1',
            mobileNumber: student.mobileNumber || '0000000000',
            address: student.address || 'Address not provided'
          }
        }
      );
      console.log(`Updated student: ${student.name}`);
    }

    console.log(`Migration completed! Updated ${studentsToUpdate.length} students`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration
migrateStudents();