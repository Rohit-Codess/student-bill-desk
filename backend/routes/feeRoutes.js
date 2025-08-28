const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const FeeType = require('../models/FeeType');
const FeeAssignment = require('../models/FeeAssignment');

// POST /api/fees/generate?month=YYYY-MM - Generate fee assignments for a month
router.post('/generate', async (req, res) => {
  try {
    const { month } = req.query;

    // Validate month format
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Use YYYY-MM format (e.g., 2024-01)'
      });
    }

    // Get all active students
    const activeStudents = await Student.find({ isActive: true });
    if (activeStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active students found'
      });
    }

    // Get all fee types
    const feeTypes = await FeeType.find({});
    if (feeTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No fee types found. Please create fee types first.'
      });
    }

    // Prepare fee assignments to insert (only for applicable classes)
    const feeAssignments = [];
    for (const student of activeStudents) {
      for (const feeType of feeTypes) {
        // Check if the fee type is applicable to the student's class
        if (feeType.applicableClasses.includes(student.class)) {
          feeAssignments.push({
            studentId: student._id,
            month: month,
            feeTypeId: feeType._id,
            amount: feeType.amount,
            status: 'pending'
          });
        }
      }
    }

    let insertedCount = 0;
    let duplicateCount = 0;
    const insertedAssignments = [];
    const duplicateDetails = [];

    // Insert fee assignments one by one to handle duplicates gracefully
    for (const assignment of feeAssignments) {
      try {
        const newAssignment = new FeeAssignment(assignment);
        const savedAssignment = await newAssignment.save();
        insertedCount++;
        insertedAssignments.push(savedAssignment);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - assignment already exists
          duplicateCount++;
          duplicateDetails.push({
            studentId: assignment.studentId,
            feeTypeId: assignment.feeTypeId,
            month: assignment.month
          });
        } else {
          throw error; // Re-throw if it's not a duplicate error
        }
      }
    }

    // Populate the inserted assignments for better response
    const populatedAssignments = await FeeAssignment.find({
      _id: { $in: insertedAssignments.map(a => a._id) }
    })
    .populate('studentId', 'name isActive class')
    .populate('feeTypeId', 'name amount applicableClasses');

    res.json({
      success: true,
      message: `Fee generation completed for ${month}`,
      data: {
        month: month,
        summary: {
          totalStudents: activeStudents.length,
          totalFeeTypes: feeTypes.length,
          expectedAssignments: feeAssignments.length,
          insertedCount: insertedCount,
          duplicateCount: duplicateCount
        },
        insertedAssignments: populatedAssignments,
        ...(duplicateCount > 0 && {
          duplicateInfo: {
            message: `${duplicateCount} assignments already existed and were skipped`,
            count: duplicateCount
          }
        })
      }
    });

  } catch (error) {
    console.error('Error generating fees:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating fee assignments',
      error: error.message
    });
  }
});

// POST /api/fees/generate-selective - Generate fees with selective parameters
router.post('/generate-selective', async (req, res) => {
  try {
    const { month, studentIds, classes, feeTypeIds } = req.body;

    // Validate month format
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Use YYYY-MM format (e.g., 2024-01)'
      });
    }

    // Build student filter
    const studentFilter = { isActive: true };
    if (studentIds && studentIds.length > 0) {
      studentFilter._id = { $in: studentIds };
    }
    if (classes && classes.length > 0) {
      studentFilter.class = { $in: classes };
    }

    // Get filtered students
    const students = await Student.find(studentFilter);
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found matching the criteria'
      });
    }

    // Build fee type filter
    const feeTypeFilter = {};
    if (feeTypeIds && feeTypeIds.length > 0) {
      feeTypeFilter._id = { $in: feeTypeIds };
    }

    // Get filtered fee types
    const feeTypes = await FeeType.find(feeTypeFilter);
    if (feeTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No fee types found matching the criteria'
      });
    }

    // Prepare fee assignments to insert
    const feeAssignments = [];
    for (const student of students) {
      for (const feeType of feeTypes) {
        // Check if the fee type is applicable to the student's class
        if (feeType.applicableClasses.includes(student.class)) {
          feeAssignments.push({
            studentId: student._id,
            month: month,
            feeTypeId: feeType._id,
            amount: feeType.amount,
            status: 'pending'
          });
        }
      }
    }

    let insertedCount = 0;
    let duplicateCount = 0;
    let skippedCount = 0;
    const insertedAssignments = [];

    // Insert fee assignments one by one to handle duplicates gracefully
    for (const assignment of feeAssignments) {
      try {
        const newAssignment = new FeeAssignment(assignment);
        const savedAssignment = await newAssignment.save();
        insertedCount++;
        insertedAssignments.push(savedAssignment);
      } catch (error) {
        if (error.code === 11000) {
          duplicateCount++;
        } else {
          throw error;
        }
      }
    }

    // Calculate skipped assignments (fee types not applicable to student classes)
    const totalPossibleAssignments = students.length * feeTypes.length;
    skippedCount = totalPossibleAssignments - feeAssignments.length;

    // Populate the inserted assignments for better response
    const populatedAssignments = await FeeAssignment.find({
      _id: { $in: insertedAssignments.map(a => a._id) }
    })
    .populate('studentId', 'name isActive class')
    .populate('feeTypeId', 'name amount applicableClasses');

    res.json({
      success: true,
      message: `Selective fee generation completed for ${month}`,
      data: {
        month: month,
        filters: {
          studentIds,
          classes,
          feeTypeIds
        },
        summary: {
          filteredStudents: students.length,
          filteredFeeTypes: feeTypes.length,
          possibleAssignments: totalPossibleAssignments,
          applicableAssignments: feeAssignments.length,
          insertedCount: insertedCount,
          duplicateCount: duplicateCount,
          skippedCount: skippedCount
        },
        insertedAssignments: populatedAssignments,
        ...(duplicateCount > 0 && {
          duplicateInfo: {
            message: `${duplicateCount} assignments already existed and were skipped`,
            count: duplicateCount
          }
        }),
        ...(skippedCount > 0 && {
          skipInfo: {
            message: `${skippedCount} assignments were skipped (fee types not applicable to student classes)`,
            count: skippedCount
          }
        })
      }
    });

  } catch (error) {
    console.error('Error in selective fee generation:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating selective fee assignments',
      error: error.message
    });
  }
});

// GET /api/fees/assignments - Get fee assignments with filters
router.get('/assignments', async (req, res) => {
  try {
    const { month, studentId, feeTypeId, status, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = {};
    if (month) filter.month = month;
    if (studentId) filter.studentId = studentId;
    if (feeTypeId) filter.feeTypeId = feeTypeId;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalCount = await FeeAssignment.countDocuments(filter);

    // Get assignments with population
    const assignments = await FeeAssignment.find(filter)
      .populate('studentId', 'name isActive')
      .populate('feeTypeId', 'name amount')
      .sort({ month: -1, studentId: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        assignments: assignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount: totalCount,
          hasNextPage: skip + assignments.length < totalCount,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee assignments',
      error: error.message
    });
  }
});

// GET /api/fees/assignments/:id - Get specific fee assignment
router.get('/assignments/:id', async (req, res) => {
  try {
    const assignment = await FeeAssignment.findById(req.params.id)
      .populate('studentId', 'name isActive')
      .populate('feeTypeId', 'name amount');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Fee assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee assignment',
      error: error.message
    });
  }
});

// PUT /api/fees/assignments/:id/status - Update fee assignment status
router.put('/assignments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'paid', 'waived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, paid, or waived'
      });
    }

    const assignment = await FeeAssignment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('studentId', 'name isActive')
    .populate('feeTypeId', 'name amount');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Fee assignment not found'
      });
    }

    res.json({
      success: true,
      message: `Fee assignment status updated to ${status}`,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating fee assignment status',
      error: error.message
    });
  }
});

// GET /api/fees/types - Get all fee types
router.get('/types', async (req, res) => {
  try {
    const feeTypes = await FeeType.find({}).sort({ name: 1 });
    
    res.json({
      success: true,
      count: feeTypes.length,
      data: feeTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee types',
      error: error.message
    });
  }
});

// POST /api/fees/types - Create new fee type
router.post('/types', async (req, res) => {
  try {
    const { name, amount, applicableClasses } = req.body;
    
    const feeType = new FeeType({ name, amount, applicableClasses });
    const savedFeeType = await feeType.save();
    
    res.status(201).json({
      success: true,
      message: 'Fee type created successfully',
      data: savedFeeType
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Fee type with this name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating fee type',
      error: error.message
    });
  }
});

// PUT /api/fees/types/:id - Update fee type
router.put('/types/:id', async (req, res) => {
  try {
    const { name, amount, applicableClasses } = req.body;
    
    const feeType = await FeeType.findByIdAndUpdate(
      req.params.id,
      { name, amount, applicableClasses },
      { new: true, runValidators: true }
    );

    if (!feeType) {
      return res.status(404).json({
        success: false,
        message: 'Fee type not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee type updated successfully',
      data: feeType
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Fee type with this name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating fee type',
      error: error.message
    });
  }
});

// DELETE /api/fees/types/:id - Delete fee type
router.delete('/types/:id', async (req, res) => {
  try {
    const feeType = await FeeType.findByIdAndDelete(req.params.id);

    if (!feeType) {
      return res.status(404).json({
        success: false,
        message: 'Fee type not found'
      });
    }

    res.json({
      success: true,
      message: 'Fee type deleted successfully',
      data: feeType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting fee type',
      error: error.message
    });
  }
});

// GET /api/fees/summary/:month - Get fee summary for a specific month
router.get('/summary/:month', async (req, res) => {
  try {
    const { month } = req.params;

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month format. Use YYYY-MM format'
      });
    }

    const summary = await FeeAssignment.aggregate([
      { $match: { month: month } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalAssignments = await FeeAssignment.countDocuments({ month });
    const totalAmount = await FeeAssignment.aggregate([
      { $match: { month: month } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        month: month,
        totalAssignments: totalAssignments,
        totalAmount: totalAmount[0]?.total || 0,
        statusBreakdown: summary,
        summary: summary.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            amount: item.totalAmount
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fee summary',
      error: error.message
    });
  }
});

module.exports = router;
