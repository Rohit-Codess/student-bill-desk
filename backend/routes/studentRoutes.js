const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students - Get all students
router.get('/', async (req, res) => {
  try {
    const { isActive, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter).sort({ name: 1 });
    
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// GET /api/students/:id - Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
});

// POST /api/students - Create new student
router.post('/', async (req, res) => {
  try {
    const { name, fatherName, gender, class: studentClass, mobileNumber, address, isActive } = req.body;
    
    const student = new Student({
      name,
      fatherName,
      gender,
      class: studentClass,
      mobileNumber,
      address,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedStudent = await student.save();
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: savedStudent
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message
    });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, fatherName, gender, class: studentClass, mobileNumber, address, isActive } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, fatherName, gender, class: studentClass, mobileNumber, address, isActive },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
});

// DELETE /api/students/:id - Delete student with automatic cascade deletion
router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get count of fee assignments before deletion for logging
    const FeeAssignment = require('../models/FeeAssignment');
    const assignmentCount = await FeeAssignment.countDocuments({ studentId: studentId });
    
    // Delete the student (pre-delete middleware will handle fee assignments)
    await Student.findByIdAndDelete(studentId);
    
    console.log(`Successfully deleted student ${student.name} and ${assignmentCount} related fee assignments`);

    res.json({
      success: true,
      message: `Student "${student.name}" deleted successfully. Also removed ${assignmentCount} related fee assignments.`,
      data: {
        deletedStudent: student,
        deletedAssignmentsCount: assignmentCount
      }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

module.exports = router;
