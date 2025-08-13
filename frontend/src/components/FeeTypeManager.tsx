import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';
import type { FeeType } from '../types';

const FeeTypeManager = () => {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
  });

  useEffect(() => {
    fetchFeeTypes();
  }, []);

  const fetchFeeTypes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFeeTypes();
      setFeeTypes(data);
      setError('');
    } catch (err) {
      const errorMessage = 'Failed to fetch fee types. Please check if the backend server is running.';
      setError(errorMessage);
      await Swal.fire({
        title: 'Connection Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeeType) {
        await apiService.updateFeeType(editingFeeType._id, formData);
        await Swal.fire({
          title: 'Updated!',
          text: 'Fee type updated successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        await apiService.createFeeType(formData);
        await Swal.fire({
          title: 'Created!',
          text: 'Fee type created successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
      
      setFormData({ name: '', amount: 0 });
      setEditingFeeType(null);
      fetchFeeTypes();
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to save fee type',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      console.error(err);
    }
  };

  const handleEdit = (feeType: FeeType) => {
    setEditingFeeType(feeType);
    setFormData({
      name: feeType.name,
      amount: feeType.amount,
    });
  };

  const handleDelete = async (id: string, feeTypeName: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-left space-y-3">
          <p>You are about to delete <strong>${feeTypeName}</strong></p>
          <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p class="text-sm text-yellow-800">
              <strong>⚠️ Warning:</strong> This may affect:
            </p>
            <ul class="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Existing fee assignments using this type</li>
              <li>• Monthly fee generation processes</li>
            </ul>
          </div>
          <p class="text-sm text-gray-600">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-6 py-2',
        cancelButton: 'rounded-lg px-6 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteFeeType(id);
        await Swal.fire({
          title: 'Deleted!',
          text: `${feeTypeName} has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        fetchFeeTypes();
      } catch (err) {
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete fee type',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
        console.error(err);
      }
    }
  };

  const cancelEdit = () => {
    setEditingFeeType(null);
    setFormData({ name: '', amount: 0 });
  };

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading fee types...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fee Type Management</h2>
            <p className="text-gray-600">Manage different types of fees and their amounts</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Tuition, Transport, Library"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
                min="0"
                step="1"
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              type="submit" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center gap-2"
            >
              {editingFeeType ? (
                <>
                  <span>✏️</span>
                  Update Fee Type
                </>
              ) : (
                <>
                  <span>➕</span>
                  Add Fee Type
                </>
              )}
            </button>
            
            {editingFeeType && (
              <button 
                type="button" 
                onClick={cancelEdit} 
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <span>❌</span>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Fee Types Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Fee Types ({feeTypes.length})</h3>
        </div>
        
        {feeTypes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fee types found</h3>
            <p className="text-gray-600">Create your first fee type using the form above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {feeTypes.map((feeType) => (
              <div key={feeType._id} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-green-600 text-lg">💳</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feeType.name}</h4>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(feeType.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(feeType.amount)}
                  </div>
                  <p className="text-sm text-gray-600">per student</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(feeType)} 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <span>✏️</span>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(feeType._id, feeType.name)} 
                    className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <span>🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {feeTypes.length > 0 && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Fee Types Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{feeTypes.length}</div>
              <div className="text-sm text-gray-600">Total Fee Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(feeTypes.reduce((sum, ft) => sum + ft.amount, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(feeTypes.reduce((sum, ft) => sum + ft.amount, 0) / feeTypes.length || 0)}
              </div>
              <div className="text-sm text-gray-600">Average Amount</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeTypeManager;
