import React, { useState, useEffect } from 'react';
import { Employee, Department, Designation } from '../types';
import { Modal } from './Modal';
import { User, Mail, Phone, Calendar, DollarSign, Building, Award, MapPin } from 'lucide-react';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employeeData: Partial<Employee>) => Promise<void>;
  employee?: Employee | null;
  departments: Department[];
  designations: Designation[];
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employee,
  departments,
  designations
}) => {
  const isEditing = Boolean(employee);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '',
    address: '',
    department_id: '' as string | number,
    designation_id: '' as string | number,
    joining_date: new Date().toISOString().split('T')[0],
    employment_type: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern',
    salary: 60000,
    status: 'Active' as 'Active' | 'Inactive' | 'On Leave' | 'Terminated'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name,
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        dob: employee.dob || '',
        address: employee.address || '',
        department_id: employee.department_id || '',
        designation_id: employee.designation_id || '',
        joining_date: employee.joining_date,
        employment_type: employee.employment_type,
        salary: employee.salary,
        status: employee.status
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        gender: 'Male',
        dob: '',
        address: '',
        department_id: departments[0]?.id || '',
        designation_id: '',
        joining_date: new Date().toISOString().split('T')[0],
        employment_type: 'Full-Time',
        salary: 65000,
        status: 'Active'
      });
    }
    setErrors({});
  }, [employee, departments, isOpen]);

  // Filter designations by selected department if selected
  const availableDesignations = formData.department_id
    ? designations.filter(d => d.department_id === Number(formData.department_id))
    : designations;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email format';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.joining_date) errs.joining_date = 'Joining date is required';
    if (!formData.salary || Number(formData.salary) <= 0) errs.salary = 'Salary must be greater than zero';
    if (!formData.department_id) errs.department_id = 'Department is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        designation_id: formData.designation_id ? Number(formData.designation_id) : undefined,
        salary: Number(formData.salary)
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save employee record' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Employee - ${employee?.employee_code}` : 'Register New Employee'}
      subtitle={isEditing ? 'Update employment details and system records' : 'Enter personal, departmental, and compensation details'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {errors.form}
          </div>
        )}

        {/* Section 1: Personal Details */}
        <div>
          <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> 1. Personal & Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full text-sm rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.full_name ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.full_name && <p className="text-xs text-rose-600 mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex.morgan@auspify.com"
                  className={`w-full text-sm rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                    errors.email ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0192"
                className={`w-full text-sm rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  errors.phone ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, City, State, ZIP"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Department & Role */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> 2. Role & Department Placement
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department_id}
                onChange={e => {
                  setFormData({ ...formData, department_id: e.target.value, designation_id: '' });
                }}
                className={`w-full text-sm rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  errors.department_id ? 'border-rose-400' : 'border-slate-300'
                }`}
              >
                <option value="">-- Select Department --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
              {errors.department_id && <p className="text-xs text-rose-600 mt-1">{errors.department_id}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Designation / Job Role</label>
              <select
                value={formData.designation_id}
                onChange={e => setFormData({ ...formData, designation_id: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Select Designation --</option>
                {availableDesignations.map(dg => (
                  <option key={dg.id} value={dg.id}>{dg.title} ({dg.salary_grade || 'Standard'})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Employment Details & Compensation */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> 3. Employment & Compensation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Joining Date *</label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                className={`w-full text-sm rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  errors.joining_date ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.joining_date && <p className="text-xs text-rose-600 mt-1">{errors.joining_date}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Employment Type</label>
              <select
                value={formData.employment_type}
                onChange={e => setFormData({ ...formData, employment_type: e.target.value as any })}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Annual Salary ($) *</label>
              <input
                type="number"
                step="500"
                value={formData.salary}
                onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                className={`w-full text-sm rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  errors.salary ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.salary && <p className="text-xs text-rose-600 mt-1">{errors.salary}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Employment Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
