import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';
import type { GenerateFeeResponse, Student, FeeType } from '../types';

const FeeGenerator = () => {
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerateFeeResponse | null>(null);
  
  // Selective generation state
  const [generationType, setGenerationType] = useState<'all' | 'selective'>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchStudentsAndFeeTypes();
  }, []);

  const fetchStudentsAndFeeTypes = async () => {
    try {
      const [studentsData, feeTypesData] = await Promise.all([
        apiService.getStudents(),
        apiService.getFeeTypes()
      ]);
      setStudents(studentsData.filter((s: Student) => s.isActive));
      setFeeTypes(feeTypesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

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
      let response;
      
      if (generationType === 'all') {
        response = await apiService.generateFees(month);
      } else {
        response = await apiService.generateSelectiveFees({
          month,
          studentIds: selectedStudents.length > 0 ? selectedStudents : undefined,
          classes: selectedClasses.length > 0 ? selectedClasses : undefined,
          feeTypeIds: selectedFeeTypes.length > 0 ? selectedFeeTypes : undefined
        });
      }
      
      setResult(response);
      
      if (response.data.summary.insertedCount > 0) {
        await Swal.fire({
          title: 'Success!',
          html: `
            <div class="text-left space-y-2">
              <p>Successfully generated <strong>${response.data.summary.insertedCount}</strong> fee assignments</p>
              <p class="text-sm text-gray-600">Month: <strong>${month}</strong></p>
              ${generationType === 'selective' ? '<p class="text-sm text-gray-600">Mode: <strong>Selective Generation</strong></p>' : ''}
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

  const allClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Graduate'];

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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Generation Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Generation Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="all"
                  checked={generationType === 'all'}
                  onChange={(e) => setGenerationType(e.target.value as 'all' | 'selective')}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Generate for All Active Students</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="selective"
                  checked={generationType === 'selective'}
                  onChange={(e) => setGenerationType(e.target.value as 'all' | 'selective')}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Selective Generation</span>
              </label>
            </div>
          </div>

          {/* Month Selection */}
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

          {/* Selective Generation Options */}
          {generationType === 'selective' && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Selective Generation Options</h4>
              
              {/* Class Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Classes (Optional)
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-3">
                  {allClasses.map((cls) => (
                    <label key={cls} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls)}
                        onChange={(e) => {
                          const classes = [...selectedClasses];
                          if (e.target.checked) {
                            classes.push(cls);
                          } else {
                            const index = classes.indexOf(cls);
                            if (index > -1) classes.splice(index, 1);
                          }
                          setSelectedClasses(classes);
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {cls === 'Graduate' ? 'Grad' : cls}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClasses([...allClasses])}
                    className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    Select All Classes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClasses([])}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear Classes
                  </button>
                </div>
              </div>

              {/* Student Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Students (Optional)
                </label>
                <div className="max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg p-3">
                  {students.map((student) => (
                    <label key={student._id} className="flex items-center space-x-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={(e) => {
                          const studentIds = [...selectedStudents];
                          if (e.target.checked) {
                            studentIds.push(student._id);
                          } else {
                            const index = studentIds.indexOf(student._id);
                            if (index > -1) studentIds.splice(index, 1);
                          }
                          setSelectedStudents(studentIds);
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        {student.name} (Class {student.class})
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudents(students.map(s => s._id))}
                    className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    Select All Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudents([])}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear Students
                  </button>
                </div>
              </div>

              {/* Fee Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Fee Types (Optional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg p-3">
                  {feeTypes.map((feeType) => (
                    <label key={feeType._id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFeeTypes.includes(feeType._id)}
                        onChange={(e) => {
                          const feeTypeIds = [...selectedFeeTypes];
                          if (e.target.checked) {
                            feeTypeIds.push(feeType._id);
                          } else {
                            const index = feeTypeIds.indexOf(feeType._id);
                            if (index > -1) feeTypeIds.splice(index, 1);
                          }
                          setSelectedFeeTypes(feeTypeIds);
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700">{feeType.name}</span>
                        <div className="text-xs text-gray-500">
                          ₹{feeType.amount.toLocaleString()} • Classes: {feeType.applicableClasses.join(', ')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFeeTypes(feeTypes.map(ft => ft._id))}
                    className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    Select All Fee Types
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFeeTypes([])}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear Fee Types
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div>
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
                  {generationType === 'all' ? 'Generate All Fees' : 'Generate Selective Fees'}
                </>
              )}
            </button>
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
              <div className="text-2xl font-bold text-blue-600">
                {result.data.summary.filteredStudents || result.data.summary.totalStudents}
              </div>
              <div className="text-sm text-blue-700">
                {generationType === 'selective' ? 'Filtered Students' : 'Active Students'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {result.data.summary.filteredFeeTypes || result.data.summary.totalFeeTypes}
              </div>
              <div className="text-sm text-green-700">
                {generationType === 'selective' ? 'Filtered Fee Types' : 'Fee Types'}
              </div>
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

          {/* Additional Stats for Selective Generation */}
          {generationType === 'selective' && result.data.summary.skippedCount !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {result.data.summary.applicableAssignments}
                </div>
                <div className="text-sm text-yellow-700">Applicable Assignments</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{result.data.summary.skippedCount}</div>
                <div className="text-sm text-gray-700">Skipped (Class Mismatch)</div>
              </div>
            </div>
          )}

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
                          <div className="text-sm text-gray-600">
                            {assignment.feeTypeId.name} • Class {assignment.studentId.class}
                          </div>
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

          {/* Skip Info */}
          {result.data.skipInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">ℹ️</span>
                <span className="text-yellow-800 font-medium">{result.data.skipInfo.message}</span>
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
          How Enhanced Fee Generation Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs">🎯</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Class-Based Fee Types</div>
                <div className="text-sm text-gray-600">Fee types are now assigned only to applicable classes</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">�</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Selective Generation</div>
                <div className="text-sm text-gray-600">Filter by specific students, classes, or fee types</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-xs">�</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Smart Duplicate Prevention</div>
                <div className="text-sm text-gray-600">Same student, month, and fee type combinations are prevented</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-xs">�</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Detailed Reporting</div>
                <div className="text-sm text-gray-600">See exactly what was created, skipped, or filtered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeGenerator;
