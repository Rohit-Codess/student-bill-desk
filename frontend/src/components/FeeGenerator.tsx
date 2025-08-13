import { useState } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';
import type { GenerateFeeResponse } from '../types';

const FeeGenerator = () => {
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerateFeeResponse | null>(null);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiService.generateFees(month);
      setResult(response);
      
      if (response.data.summary.insertedCount > 0) {
        await Swal.fire({
          title: 'Success!',
          html: `
            <div class="text-left space-y-2">
              <p>Successfully generated <strong>${response.data.summary.insertedCount}</strong> fee assignments</p>
              <p class="text-sm text-gray-600">Month: <strong>${month}</strong></p>
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        await Swal.fire({
          title: 'No New Assignments',
          text: `All fee assignments for ${month} already exist. No duplicates created.`,
          icon: 'info',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to generate fees. Make sure students and fee types exist.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      setError('Failed to generate fees. Make sure students and fee types exist.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Processing fee generation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fee Generation</h2>
            <p className="text-gray-600">Generate monthly fee assignments for all active students</p>
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

        {/* Fee Generation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                Select Month (YYYY-MM)
              </label>
              <input
                type="month"
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                max={getCurrentMonth()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={loading || !month}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Generate Fees
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Generation Results */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>📊</span>
            Generation Results
          </h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{result.data.summary.totalStudents}</div>
              <div className="text-sm text-blue-700">Active Students</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{result.data.summary.totalFeeTypes}</div>
              <div className="text-sm text-green-700">Fee Types</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{result.data.summary.insertedCount}</div>
              <div className="text-sm text-purple-700">New Assignments</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{result.data.summary.duplicateCount}</div>
              <div className="text-sm text-orange-700">Duplicates Skipped</div>
            </div>
          </div>

          {/* Newly Created Assignments */}
          {result.data.insertedAssignments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Newly Created Assignments:</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {result.data.insertedAssignments.map((assignment) => (
                    <div key={assignment._id} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-sm">
                            {assignment.studentId.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{assignment.studentId.name}</div>
                          <div className="text-sm text-gray-600">{assignment.feeTypeId.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{assignment.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{assignment.month}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Duplicate Info */}
          {result.data.duplicateInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-yellow-800 font-medium">{result.data.duplicateInfo.message}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>ℹ️</span>
          How Fee Generation Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs">🔒</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Unique Constraint</div>
                <div className="text-sm text-gray-600">Each (Student, Month, Fee Type) combination can only exist once</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">🚫</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">No Duplicates</div>
                <div className="text-sm text-gray-600">Re-running the same month won't create duplicate records</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs">👥</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Active Students Only</div>
                <div className="text-sm text-gray-600">Only students marked as 'Active' get fee assignments</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-xs">📝</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Default Status</div>
                <div className="text-sm text-gray-600">New assignments start with 'Pending' status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeGenerator;
