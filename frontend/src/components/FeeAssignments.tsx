import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';
import type { FeeAssignment, Student } from '../types';

const FeeAssignments = () => {
  const [assignments, setAssignments] = useState<FeeAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    month: '',
    studentId: '',
    status: '',
  });

  const fetchData = async () => {
    try {
      const [assignmentsData, studentsData] = await Promise.all([
        apiService.getFeeAssignments(),
        apiService.getStudents(),
      ]);
      setAssignments(assignmentsData.assignments || assignmentsData);
      setStudents(studentsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch data. Please check if the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filters.month) params.month = filters.month;
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.status) params.status = filters.status;

      const data = await apiService.getFeeAssignments(params);
      setAssignments(data.assignments || data);
      setError('');
    } catch (err) {
      setError('Failed to fetch fee assignments');
      console.error(err);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const updateStatus = async (assignmentId: string, newStatus: string, studentName: string) => {
    const result = await Swal.fire({
      title: 'Update Status',
      html: `
        <div class="text-left space-y-3">
          <p>Update status for <strong>${studentName}</strong> to:</p>
          <div class="text-center">
            <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              newStatus === 'paid' ? 'bg-green-100 text-green-800' :
              newStatus === 'waived' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }">
              ${newStatus.toUpperCase()}
            </span>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiService.updateFeeAssignmentStatus(assignmentId, newStatus);
        await Swal.fire({
          title: 'Updated!',
          text: `Status updated to ${newStatus}!`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        fetchAssignments();
      } catch (err) {
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to update status',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
        console.error(err);
      }
    }
  };

  const clearFilters = () => {
    setFilters({ month: '', studentId: '', status: '' });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'waived': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const calculateTotals = () => {
    const total = assignments.reduce((sum, assignment) => sum + assignment.amount, 0);
    const paid = assignments.filter(a => a.status === 'paid').reduce((sum, assignment) => sum + assignment.amount, 0);
    const pending = assignments.filter(a => a.status === 'pending').reduce((sum, assignment) => sum + assignment.amount, 0);
    const waived = assignments.filter(a => a.status === 'waived').reduce((sum, assignment) => sum + assignment.amount, 0);
    
    return { total, paid, pending, waived };
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading fee assignments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fee Assignments</h2>
            <p className="text-gray-600">View and manage student fee assignments</p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-700">{formatCurrency(totals.total)}</div>
            <div className="text-xs md:text-sm text-gray-600">Total Amount</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
            <div className="text-xs md:text-sm text-green-700">Paid</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(totals.pending)}</div>
            <div className="text-xs md:text-sm text-red-700">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{formatCurrency(totals.waived)}</div>
            <div className="text-xs md:text-sm text-blue-700">Waived</div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Month
              </label>
              <input
                type="month"
                id="month"
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Student
              </label>
              <select
                id="studentId"
                value={filters.studentId}
                onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={clearFilters} 
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <span>🗑️</span>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Fee Assignments ({assignments.length} {assignments.length === 1 ? 'record' : 'records'})
          </h3>
        </div>
        
        {assignments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fee assignments found</h3>
            <p className="text-gray-600">Generate some fees first or adjust your filters!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {(assignment.studentId?.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.studentId?.name || 'Unknown Student'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assignment.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assignment.feeTypeId?.name || 'Unknown Fee Type'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(assignment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(assignment.status)}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={assignment.status}
                        onChange={(e) => updateStatus(assignment._id, e.target.value, assignment.studentId?.name || 'Student')}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="waived">Waived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeAssignments;
