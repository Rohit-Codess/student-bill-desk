export interface Student {
  _id: string;
  name: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Other';
  class: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'Graduate';
  mobileNumber: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeType {
  _id: string;
  name: string;
  amount: number;
  applicableClasses: ('1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'Graduate')[];
  createdAt: string;
  updatedAt: string;
}

export interface FeeAssignment {
  _id: string;
  studentId: Student;
  month: string;
  feeTypeId: FeeType;
  amount: number;
  status: 'pending' | 'paid' | 'waived';
  createdAt: string;
  updatedAt: string;
}

export interface GenerateFeeResponse {
  success: boolean;
  message: string;
  data: {
    month: string;
    filters?: {
      studentIds?: string[];
      classes?: string[];
      feeTypeIds?: string[];
    };
    summary: {
      totalStudents?: number;
      totalFeeTypes?: number;
      filteredStudents?: number;
      filteredFeeTypes?: number;
      expectedAssignments?: number;
      possibleAssignments?: number;
      applicableAssignments?: number;
      insertedCount: number;
      duplicateCount: number;
      skippedCount?: number;
    };
    insertedAssignments: FeeAssignment[];
    duplicateInfo?: {
      message: string;
      count: number;
    };
    skipInfo?: {
      message: string;
      count: number;
    };
  };
}
