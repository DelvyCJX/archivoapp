import React, { useEffect, useState } from 'react';
import { useFirebase, Project, Payment } from '../context/FirebaseContext';
import { format, parseISO } from 'date-fns';
import { X, Download, Plus, Image as ImageIcon } from 'lucide-react';

interface PaymentManagementProps {
  project: Project;
  onClose: () => void;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ project, onClose }) => {
  const { payments, addPayment, getPayments, uploadImage } = useFirebase();
  const [projectPayments, setProjectPayments] = useState<Payment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getPayments(project.id!);
  }, [project.id, getPayments]);

  useEffect(() => {
    const pmts = payments.get(project.id!) || [];
    setProjectPayments(pmts);
  }, [payments, project.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.date) {
      alert('Please fill in required fields');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payment: Payment = {
        projectId: project.id!,
        amount: parseFloat(formData.amount),
        note: formData.note,
        date: formData.date,
      };

      if (imageUrl) {
        payment.imageUrl = imageUrl;
      }

      await addPayment(payment);

      setFormData({
        amount: '',
        note: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        imageUrl: '',
      });
      setImageFile(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error adding payment:', error);
      alert(`Error adding payment: ${error?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleExportCSV = () => {
    let csv = 'Payment Details Export\n';
    csv += `Project: ${project.name}\n`;
    csv += `Cost: $${(typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost).toFixed(2)}\n`;
    csv += `\n`;
    csv += 'Date,Amount,Note\n';

    projectPayments.forEach(payment => {
      csv += `"${payment.date}","${payment.amount}","${payment.note}"\n`;
    });

    csv += `\n=== SUMMARY ===\n`;
    csv += `Total Paid,$${totalPaid.toFixed(2)}\n`;
    csv += `Remaining,$${remaining.toFixed(2)}\n`;
    csv += `Progress,${((totalPaid / (typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost)) * 100).toFixed(0)}%\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-payments.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPaid = projectPayments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, project.cost - totalPaid);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold">{project.name} - Payments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-xl font-bold text-blue-600">${(typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost).toFixed(2)}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-50 to-green-100">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-xl font-bold text-orange-600">${remaining.toFixed(2)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Payment Progress</span>
              <span className="text-sm text-gray-600">{((totalPaid / (typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost)) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalPaid / (typeof project.cost === 'string' ? parseFloat(project.cost) : project.cost)) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Payments List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Payments</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Payment
                </button>
              </div>
            </div>

            {projectPayments.length === 0 ? (
              <p className="text-gray-500">No payments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {projectPayments.map(payment => (
                  <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">{format(parseISO(payment.date), 'MMM dd, yyyy')}</p>
                          </div>
                          {payment.note && (
                            <p className="text-sm text-gray-700">{payment.note}</p>
                          )}
                        </div>
                      </div>
                      {payment.imageUrl && (
                        <div className="ml-4">
                          <a href={payment.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Payment Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Add New Payment</h3>

              <div>
                <label className="label">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="label">Date *</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="label">Note</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Payment note (optional)"
                ></textarea>
              </div>

              <div>
                <label className="label">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={handleImageChange}
                />
                {imageFile && <p className="text-sm text-green-600 mt-1">File selected: {imageFile.name}</p>}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Payment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
