// Migration script to update existing fee types with applicableClasses field
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-bill-desk')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const feeTypeSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  applicableClasses: [String]
}, { timestamps: true });

const FeeType = mongoose.model('FeeType', feeTypeSchema);

async function migrateFeeTypes() {
  try {
    console.log('Starting fee type migration...');
    
    // Find all fee types that don't have the applicableClasses field
    const feeTypesToUpdate = await FeeType.find({
      applicableClasses: { $exists: false }
    });

    console.log(`Found ${feeTypesToUpdate.length} fee types to migrate`);

    if (feeTypesToUpdate.length === 0) {
      console.log('No fee types need migration');
      return;
    }

    // Update each fee type with default applicableClasses (all classes)
    const allClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Graduate'];
    
    for (const feeType of feeTypesToUpdate) {
      await FeeType.updateOne(
        { _id: feeType._id },
        {
          $set: {
            applicableClasses: allClasses
          }
        }
      );
      console.log(`Updated fee type: ${feeType.name} - made applicable to all classes`);
    }

    console.log(`Migration completed! Updated ${feeTypesToUpdate.length} fee types`);
    console.log('All existing fee types are now applicable to all classes by default.');
    console.log('You can edit individual fee types to specify particular classes if needed.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration
migrateFeeTypes();