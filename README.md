# Student Bill Desk Management System

A full-stack application for managing student fees and bill desk operations.

## 🚀 Features

- **Student Management**: Add, edit, and manage student records
- **Fee Type Management**: Define different types of fees (Tuition, Transport, etc.)
- **Fee Generation**: Generate monthly fee assignments for all active students
- **Duplicate Prevention**: Unique constraint ensures no duplicate fee assignments
- **Bill Desk Operations**: View and manage fee assignments with payment status
- **Real-time Dashboard**: Summary cards showing payment statistics

## 🏗️ Architecture

### Backend (Express.js + MongoDB)
- RESTful API with Express.js
- MongoDB with Mongoose ODM
- Unique compound indexes for data integrity
- CORS enabled for frontend communication

### Frontend (React + TypeScript)
- Modern React with TypeScript
- Responsive design with CSS Grid/Flexbox
- Real-time API integration
- Component-based architecture

## 📁 Project Structure

```
new/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (seed data)
│   └── server.js        # Main server file
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── services/    # API service layer
    │   └── types/       # TypeScript interfaces
    └── package.json
```

## 🎯 Core Requirements Implemented

### Database Schema
1. **Students**: `id`, `name`, `isActive`
2. **Fee Types**: `id`, `name`, `amount`
3. **Fee Assignments**: `id`, `studentId`, `month`, `feeTypeId`, `amount`, `status`
   - **Unique constraint**: `(studentId, month, feeTypeId)`

### API Endpoints
- **POST** `/api/generate?month=YYYY-MM` - Generate fees without duplicates
- **GET** `/api/assignments` - Fetch fee assignments with filters
- **CRUD** operations for students and fee types

### Duplicate Prevention
- MongoDB unique compound index
- First call: Inserts N rows
- Second call: Inserts 0 rows (duplicates detected)

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Setup
- Ensure MongoDB is running on `localhost:27017`
- Use the "Seed Sample Data" button in the frontend to populate test data

## 🔧 API Usage Examples

### Generate Fees
```bash
POST http://localhost:5000/api/generate?month=2024-01
```

### Get Fee Assignments
```bash
GET http://localhost:5000/api/assignments?month=2024-01&status=pending
```

## 🎨 Frontend Features

1. **Student Manager**: Add/edit/delete students
2. **Fee Type Manager**: Manage fee types and amounts
3. **Fee Generator**: Generate monthly fees with duplicate prevention
4. **Fee Assignments**: View and update payment status

## 🔒 Key Features

- **Data Integrity**: Unique constraints prevent duplicate fee assignments
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback on all operations
- **Error Handling**: Comprehensive error messages and validation
- **Type Safety**: Full TypeScript implementation

## 🎯 Business Logic

1. Only **active students** get fee assignments
2. **All fee types** are assigned to each active student
3. **Unique constraint** prevents duplicates: `(studentId, month, feeTypeId)`
4. **Status tracking**: pending → paid/waived
5. **Monthly generation**: Run multiple times safely
