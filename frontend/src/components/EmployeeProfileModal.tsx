import React, { useState, useEffect } from 'react';
import { EmployeeDetail } from '../types';
import { api } from '../services/api';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { 
  Mail, Phone, Calendar, DollarSign, Building, Award, MapPin, 
  Clock, CheckCircle, Shield, Briefcase
} from 'lucide-react';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number | null;
  onStatusChange?: () => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  onStatusChange
}) => {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true);
      api.getEmployee(employeeId)
        .then(data => setEmployee(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setEmployee(null);
    }
  }, [isOpen, employeeId]);

  const handleToggleStatus = async (newStatus: string) => {
    if (!employee) return;
    setUpdatingStatus(true);
    try {
      await api.updateEmployeeStatus(employee.id, newStatus);
      const refreshed = await api.getEmployee(employee.id);
      setEmployee(refreshed);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `${employee.full_name}` : 'Employee Dossier'}
      subtitle={employee ? `${employee.employee_code} • Auspify Technologies Internal Record` : ''}
      maxWidth="max-w-3xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading employee profile...</p>
        </div>
      ) : employee ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-xl border border-slate-200/80 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-500/20">
                {employee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-lg font-bold text-slate-900">{employee.full_name}</h3>
                  <Badge>{employee.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-brand-600" />
                  {employee.designation_title || 'Unassigned Role'} • {employee.department_name || 'No Dept'}
                </p>
              </div>
            </div>

            {/* Quick Status Action */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={employee.status}
                disabled={updatingStatus}
                onChange={e => handleToggleStatus(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Details */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Contact & Location
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Work Email</span>
                  <span className="font-medium text-slate-800">{employee.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Phone</span>
                  <span className="font-medium text-slate-800">{employee.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Gender</span>
                  <span className="font-medium text-slate-800">{employee.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Date of Birth</span>
                  <span className="font-medium text-slate-800">{employee.dob || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 text-xs">Address</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{employee.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Employment & Compensation */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Employment & Compensation
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Department</span>
                  <span className="font-medium text-slate-800">{employee.department_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Role Title</span>
                  <span className="font-medium text-slate-800">{employee.designation_title || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Joining Date</span>
                  <span className="font-medium text-slate-800">{employee.joining_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 text-xs">Employment Type</span>
                  <span className="font-medium text-slate-800">{employee.employment_type}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 text-xs">Annual Compensation</span>
                  <span className="font-bold text-brand-700">${employee.salary.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attendance History */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recent Attendance History
              </h4>
              <span className="text-xs text-slate-400">Latest records</span>
            </div>
            
            {employee.recent_attendance && employee.recent_attendance.length > 0 ? (
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3.5 py-2 text-left font-medium">Date</th>
                      <th className="px-3.5 py-2 text-left font-medium">Status</th>
                      <th className="px-3.5 py-2 text-left font-medium">Check In</th>
                      <th className="px-3.5 py-2 text-left font-medium">Check Out</th>
                      <th className="px-3.5 py-2 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {employee.recent_attendance.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="px-3.5 py-2 font-medium">{a.attendance_date}</td>
                        <td className="px-3.5 py-2"><Badge>{a.status}</Badge></td>
                        <td className="px-3.5 py-2 text-slate-600">{a.check_in || '-'}</td>
                        <td className="px-3.5 py-2 text-slate-600">{a.check_out || '-'}</td>
                        <td className="px-3.5 py-2 text-slate-500">{a.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg text-center">
                No recent attendance records found for this employee.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 py-6 text-center">Unable to load employee information.</p>
      )}
    </Modal>
  );
};
