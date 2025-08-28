// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API service functions
export const apiService = {
  async deleteFeeAssignment(id: string) {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete fee assignment');
    const result = await response.json();
    return result;
  },
  // Student APIs
  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    const result = await response.json();
    return result.success ? result.data : [];
  },

  async createStudent(student: { 
    name: string; 
    fatherName: string; 
    gender: 'Male' | 'Female' | 'Other'; 
    class: string; 
    mobileNumber: string; 
    address: string; 
    isActive: boolean 
  }) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    if (!response.ok) throw new Error('Failed to create student');
    const result = await response.json();
    return result;
  },

  async updateStudent(id: string, student: { 
    name: string; 
    fatherName: string; 
    gender: 'Male' | 'Female' | 'Other'; 
    class: string; 
    mobileNumber: string; 
    address: string; 
    isActive: boolean 
  }) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    if (!response.ok) throw new Error('Failed to update student');
    const result = await response.json();
    return result;
  },

  async deleteStudent(id: string) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete student');
    const result = await response.json();
    return result;
  },

  // Fee Type APIs
  async getFeeTypes() {
    const response = await fetch(`${API_BASE_URL}/types`);
    if (!response.ok) throw new Error('Failed to fetch fee types');
    const result = await response.json();
    return result.success ? result.data : [];
  },

  async createFeeType(feeType: { name: string; amount: number; applicableClasses: string[] }) {
    const response = await fetch(`${API_BASE_URL}/types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feeType),
    });
    if (!response.ok) throw new Error('Failed to create fee type');
    const result = await response.json();
    return result;
  },

  async updateFeeType(id: string, feeType: { name: string; amount: number; applicableClasses: string[] }) {
    const response = await fetch(`${API_BASE_URL}/types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feeType),
    });
    if (!response.ok) throw new Error('Failed to update fee type');
    const result = await response.json();
    return result;
  },

  async deleteFeeType(id: string) {
    const response = await fetch(`${API_BASE_URL}/types/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete fee type');
    const result = await response.json();
    return result;
  },

  // Fee Assignment APIs
  async generateFees(month: string) {
    const response = await fetch(`${API_BASE_URL}/generate?month=${month}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate fees');
    const result = await response.json();
    return result;
  },

  async generateSelectiveFees(params: {
    month: string;
    studentIds?: string[];
    classes?: string[];
    feeTypeIds?: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/generate-selective`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to generate selective fees');
    const result = await response.json();
    return result;
  },

  async getFeeAssignments(params?: { month?: string; studentId?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month);
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.status) queryParams.append('status', params.status);
    
    const response = await fetch(`${API_BASE_URL}/assignments?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch fee assignments');
    const result = await response.json();
    return result.success ? result.data : { assignments: [], pagination: {} };
  },

  async updateFeeAssignmentStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update fee assignment status');
    const result = await response.json();
    return result;
  },

  // Seed data
  async seedData() {
    const response = await fetch(`${API_BASE_URL}/seed`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to seed data');
    return response.json();
  },
};
