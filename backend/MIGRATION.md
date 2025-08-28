# Migration Instructions

## Overview
This document contains migration scripts for database schema updates.

## Student Migration (Already Completed)
This migration script updates existing students in the database to include the new required fields:
- fatherName
- gender  
- class
- mobileNumber
- address

### Running the Student Migration

1. **Before running the migration, backup your database**

2. **Run the migration script:**
   ```bash
   cd backend
   node migrate-students.js
   ```

## Fee Type Migration (New)
This migration adds the `applicableClasses` field to existing fee types.

### Running the Fee Type Migration

1. **Backup your database first**

2. **Run the fee type migration:**
   ```bash
   cd backend
   node migrate-feetypes.js
   ```

3. **What this migration does:**
   - Adds `applicableClasses` field to all existing fee types
   - Sets all existing fee types to be applicable to all classes (1-12 and Graduate)
   - You can later edit individual fee types to specify particular classes

### Default Values for Fee Types
For existing fee types, the following default values will be set:
- applicableClasses: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Graduate"]

## After All Migrations
- Restart your backend server
- Update records through the UI as needed
- The new validation rules will apply to all future records

## Enhanced Features Available After Migration

### Fee Types
- ✅ Class-specific fee assignment
- ✅ Selective fee generation
- ✅ Enhanced reporting

### Students  
- ✅ Complete student profiles
- ✅ Class-based fee filtering
- ✅ Enhanced search and filtering

## Rollback Instructions

### Student Fields Rollback
```javascript
db.students.updateMany({}, {
  $unset: {
    fatherName: "",
    gender: "",
    class: "",
    mobileNumber: "",
    address: ""
  }
})
```

### Fee Type Fields Rollback
```javascript
db.feetypes.updateMany({}, {
  $unset: {
    applicableClasses: ""
  }
})
```