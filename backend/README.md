# Student Bill Desk Backend

A comprehensive Express.js backend for managing student fee assignments with MongoDB.

## Features

- ✅ **Student Management**: CRUD operations for students
- ✅ **Fee Type Management**: CRUD operations for fee types
- ✅ **Fee Assignment Generation**: Bulk generate monthly fees without duplicates
- ✅ **Duplicate Prevention**: Unique constraint on (studentId, month, feeTypeId)
- ✅ **Status Management**: Track payment status (pending/paid/waived)
- ✅ **Comprehensive API**: RESTful endpoints with proper error handling
- ✅ **Data Validation**: Input validation and sanitization
- ✅ **Pagination**: Efficient data retrieval with pagination
- ✅ **Search & Filters**: Advanced filtering and search capabilities

## Database Schema

### Students
- `id` (ObjectId, Primary Key)
- `name` (String, required, 2-100 chars)
- `isActive` (Boolean, default: true)
- `createdAt`, `updatedAt` (Timestamps)

### Fee Types
- `id` (ObjectId, Primary Key)
- `name` (String, required, unique, 2-50 chars)
- `amount` (Number, required, ≥ 0)
- `createdAt`, `updatedAt` (Timestamps)

### Fee Assignments
- `id` (ObjectId, Primary Key)
- `studentId` (ObjectId, FK → students.id)
- `month` (String, YYYY-MM format)
- `feeTypeId` (ObjectId, FK → fee_types.id)
- `amount` (Number, ≥ 0)
- `status` (Enum: pending|paid|waived, default: pending)
- `createdAt`, `updatedAt` (Timestamps)
- **Unique Constraint**: (studentId, month, feeTypeId)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (already created):
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/student_bill_desk
   ```

3. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check API status

### Student Management
- **GET** `/api/students` - Get all students (with filters)
- **GET** `/api/students/:id` - Get student by ID
- **POST** `/api/students` - Create new student
- **PUT** `/api/students/:id` - Update student
- **DELETE** `/api/students/:id` - Delete student

### Fee Type Management
- **GET** `/api/fees/types` - Get all fee types
- **POST** `/api/fees/types` - Create new fee type

### Fee Assignment Management
- **POST** `/api/fees/generate?month=YYYY-MM` - 🎯 **Main Endpoint**: Generate fees for month
- **GET** `/api/fees/assignments` - Get fee assignments (with filters & pagination)
- **GET** `/api/fees/assignments/:id` - Get specific fee assignment
- **PUT** `/api/fees/assignments/:id/status` - Update assignment status

### Reports & Analytics
- **GET** `/api/fees/summary/:month` - Get fee summary for specific month

## Core Functionality: Fee Generation

### Endpoint: `POST /api/fees/generate?month=YYYY-MM`

**Purpose**: Generate fee assignments for all active students for a specific month.

**Key Features**:
1. ✅ **Duplicate Prevention**: Uses unique constraint (studentId, month, feeTypeId)
2. ✅ **Idempotent**: Re-running for same month creates 0 new records
3. ✅ **Active Students Only**: Only generates fees for `isActive: true` students
4. ✅ **Bulk Processing**: Processes all student-fee type combinations
5. ✅ **Detailed Response**: Shows inserted vs duplicate counts

**Example Usage**:
```bash
# First call - Creates new assignments
POST http://localhost:3000/api/fees/generate?month=2024-01

# Second call - Creates 0 new assignments (all duplicates)
POST http://localhost:3000/api/fees/generate?month=2024-01
```

**Response Format**:
```json
{
  "success": true,
  "message": "Fee generation completed for 2024-01",
  "data": {
    "month": "2024-01",
    "summary": {
      "totalStudents": 6,
      "totalFeeTypes": 6,
      "expectedAssignments": 36,
      "insertedCount": 36,
      "duplicateCount": 0
    },
    "insertedAssignments": [...],
    "duplicateInfo": {
      "message": "0 assignments already existed and were skipped",
      "count": 0
    }
  }
}
```

## Testing the Duplicate Prevention

1. **Seed the database**:
   ```javascript
   // Add this route to server.js for easy testing:
   app.post('/api/seed', async (req, res) => {
     try {
       const { seedDatabase } = require('./utils/seedData');
       const result = await seedDatabase();
       res.json({ success: true, message: 'Database seeded', data: result });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   });
   ```

2. **Generate fees for first time**:
   ```bash
   POST http://localhost:3000/api/fees/generate?month=2024-01
   # Response: insertedCount: 36, duplicateCount: 0
   ```

3. **Generate fees for same month again**:
   ```bash
   POST http://localhost:3000/api/fees/generate?month=2024-01
   # Response: insertedCount: 0, duplicateCount: 36
   ```

4. **Verify with GET request**:
   ```bash
   GET http://localhost:3000/api/fees/assignments?month=2024-01
   # Should show all 36 assignments created in step 2
   ```

## Query Examples

### Get Students
```bash
GET /api/students                     # All students
GET /api/students?isActive=true       # Only active students
GET /api/students?search=john         # Search by name
```

### Get Fee Assignments
```bash
GET /api/fees/assignments?month=2024-01           # All assignments for January 2024
GET /api/fees/assignments?status=pending         # All pending assignments
GET /api/fees/assignments?studentId=<student_id> # All assignments for a student
GET /api/fees/assignments?page=2&limit=20        # Pagination
```

### Get Fee Summary
```bash
GET /api/fees/summary/2024-01  # Summary for January 2024
```

## Error Handling

The API includes comprehensive error handling:
- ✅ Input validation errors
- ✅ Duplicate key errors
- ✅ Not found errors
- ✅ Database connection errors
- ✅ Proper HTTP status codes
- ✅ Detailed error messages

## Development

### Adding Seed Route (Optional)
Add this to `server.js` for easy database seeding:

```javascript
// Seed Route (for development/testing)
app.post('/api/seed', async (req, res) => {
  try {
    const { seedDatabase } = require('./utils/seedData');
    const result = await seedDatabase();
    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message
    });
  }
});
```

## Production Considerations

1. **Environment Variables**: Use proper environment variables for production
2. **Database Security**: Use authentication and proper connection strings
3. **Rate Limiting**: Add rate limiting middleware
4. **Logging**: Add proper logging (Winston, Morgan)
5. **Validation**: Consider using Joi or express-validator for more robust validation
6. **Monitoring**: Add health checks and monitoring

## License

MIT
