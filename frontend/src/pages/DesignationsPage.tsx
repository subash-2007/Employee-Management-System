import React, { useState, useEffect } from 'react';
import { 
  Award, Plus, Edit2, Trash2, Building, DollarSign, 
  Users, CheckCircle2, Search, Filter
} from 'lucide-react';
import { api } from '../services/api';
import { Designation, Department } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const DesignationsPage: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
  const [desigForm, setDesigForm] = useState({
    title: '',
    department_id: '' as string | number,
    code: '',
    salary_grade: 'L2 - Mid',
    min_salary: 50000,
    max_salary: 95000,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [desigToDelete, setDesigToDelete] = useState<Designation | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDeptFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const deptFilterId = selectedDeptFilter !== 'all' ? Number(selectedDeptFilter) : undefined;
      const [desigs, depts] = await Promise.all([
        api.getDesignations(deptFilterId),
        api.getDepartments()
      ]);
      setDesignations(desigs);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDesig(null);
    setDesigForm({
      title: '',
      department_id: departments[0]?.id || '',
      code: '',
      salary_grade: 'L2 - Mid',
      min_salary: 60000,
      max_salary: 110000,
      description: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (desig: Designation) => {
    setEditingDesig(desig);
    setDesigForm({
      title: desig.title,
      department_id: desig.department_id,
      code: desig.code,
      salary_grade: desig.salary_grade || 'L2 - Mid',
      min_salary: desig.min_salary,
      max_salary: desig.max_salary,
      description: desig.description || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!desigForm.title.trim()) errs.title = 'Title is required';
    if (!desigForm.department_id) errs.department_id = 'Associated department is required';
    if (Number(desigForm.min_salary) > Number(desigForm.max_salary)) {
      errs.salary = 'Minimum salary cannot exceed maximum salary';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...desigForm,
        department_id: Number(desigForm.department_id),
        min_salary: Number(desigForm.min_salary),
        max_salary: Number(desigForm.max_salary)
      };

      if (editingDesig) {
        await api.updateDesignation(editingDesig.id, payload);
        showToast(`Designation '${desigForm.title}' updated`);
      } else {
        await api.createDesignation(payload);
        showToast(`Designation '${desigForm.title}' created`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrors({ form: err.message || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!desigToDelete) return;
    try {
      await api.deleteDesignation(desigToDelete.id);
      showToast(`Designation '${desigToDelete.title}' removed`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDesigToDelete(null);
    }
  };

  const filtered = designations.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.department_name && d.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Designation & Role Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define corporate job titles, pay bands, department mappings, and salary bands.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Designation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search roles by title, code, or department..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">Filter Dept:</span>
            <select
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-400">({designations.length} total)</span>
        </div>
      </div>

      {/* Designations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading designations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No designations found</h3>
            <p className="text-xs text-slate-400">Create designations to associate with departments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Designation Title</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Level / Grade</th>
                  <th className="px-4 py-3 text-left">Salary Range</th>
                  <th className="px-4 py-3 text-left">Active Staff</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-700 whitespace-nowrap">{d.code}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <span className="font-bold text-slate-900 block">{d.title}</span>
                        {d.description && <span className="text-3xs text-slate-400 block line-clamp-1">{d.description}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        <Building className="w-3 h-3 text-slate-500" />
                        {d.department_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{d.salary_grade || 'Standard'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800">
                      ${d.min_salary.toLocaleString()} - ${d.max_salary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-brand-600" />
                        {d.employee_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          title="Edit Designation"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDesigToDelete(d);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete Designation"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDesig ? `Edit Designation: ${editingDesig.title}` : 'Add New Designation'}
        subtitle="Associate role with department, assign grade level and salary bounds"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errors.form}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Designation Title *</label>
            <input
              type="text"
              value={desigForm.title}
              onChange={e => setDesigForm({ ...desigForm, title: e.target.value })}
              placeholder="e.g. Lead Machine Learning Engineer"
              className={`w-full text-xs rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                errors.title ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department Mapping *</label>
            <select
              value={desigForm.department_id}
              onChange={e => setDesigForm({ ...desigForm, department_id: e.target.value })}
              className={`w-full text-xs rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Salary Grade / Level</label>
              <select
                value={desigForm.salary_grade}
                onChange={e => setDesigForm({ ...desigForm, salary_grade: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="L1 - Entry">L1 - Entry Level</option>
                <option value="L2 - Mid">L2 - Mid Level</option>
                <option value="L3 - Specialist">L3 - Senior / Specialist</option>
                <option value="L4 - Management">L4 - Team Lead / Manager</option>
                <option value="L5 - Executive">L5 - Principal / Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Role Code (Optional)</label>
              <input
                type="text"
                value={desigForm.code}
                onChange={e => setDesigForm({ ...desigForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. DES-MLE"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Min Annual Salary ($)</label>
              <input
                type="number"
                value={desigForm.min_salary}
                onChange={e => setDesigForm({ ...desigForm, min_salary: Number(e.target.value) })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Max Annual Salary ($)</label>
              <input
                type="number"
                value={desigForm.max_salary}
                onChange={e => setDesigForm({ ...desigForm, max_salary: Number(e.target.value) })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          {errors.salary && <p className="text-xs text-rose-600">{errors.salary}</p>}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description & Key Responsibilities</label>
            <textarea
              rows={3}
              value={desigForm.description}
              onChange={e => setDesigForm({ ...desigForm, description: e.target.value })}
              placeholder="Outline expectations, core stack, and objectives for this role..."
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingDesig ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDesigToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Designation"
        message={`Are you sure you want to delete '${desigToDelete?.title}'? Note: Any staff members holding this designation will have their designation set to 'Unassigned'.`}
        confirmText="Delete Role"
        isDestructive={true}
      />
    </div>
  );
};
