import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit2, Trash2, Users, Award, 
  Calendar, CheckCircle2, Search, Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { Department } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    description: '',
    head_name: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptForm({ code: '', name: '', description: '', head_name: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
      head_name: dept.head_name || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      setFormErrors({ name: 'Department name is required' });
      return;
    }

    setSubmitting(true);
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, {
          name: deptForm.name,
          description: deptForm.description,
          head_name: deptForm.head_name
        });
        showToast(`Department '${deptForm.name}' updated`);
      } else {
        await api.createDepartment(deptForm);
        showToast(`Department '${deptForm.name}' created`);
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err: any) {
      setFormErrors({ form: err.message || 'Operation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    try {
      await api.deleteDepartment(deptToDelete.id);
      showToast(`Department '${deptToDelete.name}' deleted`);
      loadDepartments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeptToDelete(null);
    }
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.head_name && d.head_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-xl font-bold text-slate-900">Department Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure organizational divisions, department leadership, and track assigned headcount.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search departments by name, code, or department head..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-800">{departments.length}</span> departments
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading departments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No departments found</h3>
          <p className="text-xs text-slate-400 mt-1">Create your first department to organize employees.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(dept => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-3xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                        {dept.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{dept.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeptToDelete(dept);
                        setIsDeleteOpen(true);
                      }}
                      title="Delete Department"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2 min-h-[32px]">
                  {dept.description || 'No department description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department Head:</span>
                    <span className="font-semibold text-slate-800">{dept.head_name || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Established:</span>
                    <span className="text-slate-600">{dept.created_at ? new Date(dept.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Headcount pill and job roles */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  <span className="font-bold text-slate-900">{dept.employee_count}</span> staff members
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{dept.designation_count} roles</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Add New Department'}
        subtitle="Configure department metadata, code identifier, and leadership"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formErrors.form && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formErrors.form}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              value={deptForm.name}
              onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="e.g. Cyber Security & Infrastructure"
              className={`w-full text-xs rounded-lg border px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                formErrors.name ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {formErrors.name && <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          {!editingDept && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Department Code <span className="text-slate-400">(Optional, auto-generated if left blank)</span>
              </label>
              <input
                type="text"
                value={deptForm.code}
                onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. DEP-SEC"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department Head / Manager</label>
            <input
              type="text"
              value={deptForm.head_name}
              onChange={e => setDeptForm({ ...deptForm, head_name: e.target.value })}
              placeholder="e.g. Samantha Carter"
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
              placeholder="Brief description of department scope and responsibilities..."
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
              {submitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeptToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message={`Are you sure you want to delete '${deptToDelete?.name}'? Note: Any employees currently assigned to this department will be set to 'Unassigned'.`}
        confirmText="Delete Department"
        isDestructive={true}
      />
    </div>
  );
};
