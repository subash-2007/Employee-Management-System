import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Download, ArrowUpDown, 
  MoreVertical, Edit2, Trash2, Eye, CheckCircle2, XCircle, 
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Employee, Department, Designation, EmployeeListResponse } from '../types';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { EmployeeProfileModal } from '../components/EmployeeProfileModal';

export const EmployeesPage: React.FC = () => {
  const [employeesData, setEmployeesData] = useState<EmployeeListResponse>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
    items: []
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [selectedDesig, setSelectedDesig] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState('joining_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [profileEmployeeId, setProfileEmployeeId] = useState<number | null>(null);
  
  // Delete confirm
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDepartmentsAndDesignations();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [currentPage, selectedDept, selectedDesig, selectedStatus, selectedType, sortBy, sortOrder]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDepartmentsAndDesignations = async () => {
    try {
      const [depts, desigs] = await Promise.all([
        api.getDepartments(),
        api.getDesignations()
      ]);
      setDepartments(depts);
      setDesignations(desigs);
    } catch (err) {
      console.error('Error loading filters data:', err);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees({
        page: currentPage,
        limit: 10,
        search: searchTerm.trim() || undefined,
        department_id: selectedDept,
        designation_id: selectedDesig,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        employment_type: selectedType !== 'all' ? selectedType : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setEmployeesData(res);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEmployees();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept(undefined);
    setSelectedDesig(undefined);
    setSelectedStatus('all');
    setSelectedType('all');
    setSortBy('joining_date');
    setSortOrder('desc');
    setCurrentPage(1);
    setTimeout(() => loadEmployees(), 50);
  };

  const handleFormSubmit = async (empData: Partial<Employee>) => {
    if (selectedEmployeeForEdit) {
      await api.updateEmployee(selectedEmployeeForEdit.id, empData);
      showToast(`Employee ${empData.full_name || ''} updated successfully`);
    } else {
      await api.createEmployee(empData);
      showToast(`Employee ${empData.full_name || ''} registered successfully`);
    }
    loadEmployees();
    loadDepartmentsAndDesignations();
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    try {
      await api.deleteEmployee(employeeToDelete.id);
      showToast(`Employee ${employeeToDelete.full_name} deleted`);
      loadEmployees();
      loadDepartmentsAndDesignations();
    } catch (err: any) {
      alert(`Error deleting employee: ${err.message}`);
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.updateEmployeeStatus(emp.id, nextStatus);
      showToast(`${emp.full_name} marked as ${nextStatus}`);
      loadEmployees();
    } catch (err: any) {
      alert(`Error changing status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company personnel, job allocations, salaries, and employment status.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href={api.getExportEmployeesCsvUrl()}
            download
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export CSV
          </a>
          <button
            onClick={() => {
              setSelectedEmployeeForEdit(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by staff name, employee ID, email, or phone..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <div>
            <label className="block text-3xs font-semibold text-slate-400 uppercase mb-1">Department</label>
            <select
              value={selectedDept || ''}
              onChange={e => {
                setSelectedDept(e.target.value ? Number(e.target.value) : undefined);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Designation Filter */}
          <div>
            <label className="block text-3xs font-semibold text-slate-400 uppercase mb-1">Designation</label>
            <select
              value={selectedDesig || ''}
              onChange={e => {
                setSelectedDesig(e.target.value ? Number(e.target.value) : undefined);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Roles</option>
              {designations.map(dg => (
                <option key={dg.id} value={dg.id}>{dg.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-3xs font-semibold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-3xs font-semibold text-slate-400 uppercase mb-1">Contract Type</label>
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-3xs font-semibold text-slate-400 uppercase mb-1">Sort Field</label>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="joining_date">Joining Date</option>
              <option value="full_name">Staff Name</option>
              <option value="salary">Salary</option>
              <option value="employee_code">Employee ID</option>
            </select>
          </div>

          {/* Sort Order & Reset */}
          <div className="flex items-end gap-1.5">
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setCurrentPage(1);
              }}
              className="flex-1 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              {sortOrder.toUpperCase()}
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset filters"
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Retrieving employee roster...</p>
          </div>
        ) : employeesData.items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No employees match criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms or filters, or register a new employee.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  <th className="px-4 py-3 text-left">Full Name</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Role / Designation</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Salary</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employeesData.items.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-700 whitespace-nowrap">
                      {emp.employee_code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {emp.full_name[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{emp.full_name}</span>
                          <span className="text-slate-400 text-3xs block">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                      {emp.department_name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {emp.designation_title || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {emp.joining_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800">
                      ${emp.salary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge>{emp.status}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Profile Button */}
                        <button
                          onClick={() => setProfileEmployeeId(emp.id)}
                          title="View Employee Profile"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.status === 'Active'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {emp.status === 'Active' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setSelectedEmployeeForEdit(emp);
                            setIsFormOpen(true);
                          }}
                          title="Edit Employee"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setEmployeeToDelete(emp);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete Employee"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing <span className="font-semibold text-slate-700">{employeesData.items.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{employeesData.total}</span> employees
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-2">
              Page {employeesData.page} of {employeesData.total_pages || 1}
            </span>
            <button
              disabled={currentPage >= employeesData.total_pages}
              onClick={() => setCurrentPage(p => Math.min(employeesData.total_pages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Registration / Edit Modal */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEmployeeForEdit(null);
        }}
        onSubmit={handleFormSubmit}
        employee={selectedEmployeeForEdit}
        departments={departments}
        designations={designations}
      />

      {/* Employee Profile Dossier Modal */}
      <EmployeeProfileModal
        isOpen={Boolean(profileEmployeeId)}
        onClose={() => setProfileEmployeeId(null)}
        employeeId={profileEmployeeId}
        onStatusChange={() => loadEmployees()}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDelete?.full_name} (${employeeToDelete?.employee_code})? This will permanently remove the record and associated attendance history.`}
        confirmText="Delete Record"
        isDestructive={true}
      />
    </div>
  );
};
