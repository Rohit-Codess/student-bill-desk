export interface Student {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeType {
  _id: string;
  name: string;
  amount: number;
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
    summary: {
      totalStudents: number;
      totalFeeTypes: number;
      expectedAssignments: number;
      insertedCount: number;
      duplicateCount: number;
    };
    insertedAssignments: FeeAssignment[];
    duplicateInfo?: {
      message: string;
      count: number;
    };
  };
}
