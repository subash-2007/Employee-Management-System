import {
  Department,
  Designation,
  Employee,
  EmployeeDetail,
  EmployeeListResponse,
  AttendanceRecord,
  DashboardStats,
  CompanySettings,
  DepartmentReportItem,
  AttendanceSummaryReport
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // System & Dashboard
  getHealth: () => fetch(`${API_BASE}/health`).then(handleResponse<{ status: string }>),
  getDashboardStats: () => fetch(`${API_BASE}/dashboard/stats`).then(res => handleResponse<DashboardStats>(res)),

  // Departments
  getDepartments: () => fetch(`${API_BASE}/departments`).then(res => handleResponse<Department[]>(res)),
  getDepartment: (id: number) => fetch(`${API_BASE}/departments/${id}`).then(res => handleResponse<Department>(res)),
  createDepartment: (data: Partial<Department>) =>
    fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Department>(res)),
  updateDepartment: (id: number, data: Partial<Department>) =>
    fetch(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Department>(res)),
  deleteDepartment: (id: number) =>
    fetch(`${API_BASE}/departments/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res)),

  // Designations
  getDesignations: (departmentId?: number) => {
    const url = departmentId ? `${API_BASE}/designations?department_id=${departmentId}` : `${API_BASE}/designations`;
    return fetch(url).then(res => handleResponse<Designation[]>(res));
  },
  createDesignation: (data: Partial<Designation>) =>
    fetch(`${API_BASE}/designations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Designation>(res)),
  updateDesignation: (id: number, data: Partial<Designation>) =>
    fetch(`${API_BASE}/designations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Designation>(res)),
  deleteDesignation: (id: number) =>
    fetch(`${API_BASE}/designations/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res)),

  // Employees
  getEmployees: (params: {
    page?: number;
    limit?: number;
    search?: string;
    department_id?: number;
    designation_id?: number;
    status?: string;
    employment_type?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.department_id) query.append('department_id', params.department_id.toString());
    if (params.designation_id) query.append('designation_id', params.designation_id.toString());
    if (params.status) query.append('status', params.status);
    if (params.employment_type) query.append('employment_type', params.employment_type);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_order) query.append('sort_order', params.sort_order);

    return fetch(`${API_BASE}/employees?${query.toString()}`).then(res => handleResponse<EmployeeListResponse>(res));
  },
  getEmployee: (id: number) => fetch(`${API_BASE}/employees/${id}`).then(res => handleResponse<EmployeeDetail>(res)),
  createEmployee: (data: Partial<Employee>) =>
    fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Employee>(res)),
  updateEmployee: (id: number, data: Partial<Employee>) =>
    fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Employee>(res)),
  updateEmployeeStatus: (id: number, status: string) =>
    fetch(`${API_BASE}/employees/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(res => handleResponse<Employee>(res)),
  deleteEmployee: (id: number) =>
    fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res)),
  getExportEmployeesCsvUrl: () => `${API_BASE}/employees/export/csv`,

  // Attendance
  getAttendance: (params: { attendance_date?: string; employee_id?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params.attendance_date) query.append('attendance_date', params.attendance_date);
    if (params.employee_id) query.append('employee_id', params.employee_id.toString());
    if (params.status) query.append('status', params.status);
    return fetch(`${API_BASE}/attendance?${query.toString()}`).then(res => handleResponse<AttendanceRecord[]>(res));
  },
  markAttendance: (data: Partial<AttendanceRecord>) =>
    fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<AttendanceRecord>(res)),
  quickMarkToday: (status: string = 'Present') =>
    fetch(`${API_BASE}/attendance/quick-mark-today?status=${encodeURIComponent(status)}`, {
      method: 'POST'
    }).then(res => handleResponse<{ message: string }>(res)),
  deleteAttendance: (id: number) =>
    fetch(`${API_BASE}/attendance/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ message: string }>(res)),

  // Reports
  getReportsDirectory: () => fetch(`${API_BASE}/reports/directory`).then(res => handleResponse<Employee[]>(res)),
  getReportsDepartments: () => fetch(`${API_BASE}/reports/departments`).then(res => handleResponse<DepartmentReportItem[]>(res)),
  getReportsNewJoiners: (days: number = 90) => fetch(`${API_BASE}/reports/new-joiners?days=${days}`).then(res => handleResponse<Employee[]>(res)),
  getReportsActiveInactive: () => fetch(`${API_BASE}/reports/active-inactive`).then(res => handleResponse<Record<string, { count: number; total_salary: number; employees: Employee[] }>>(res)),
  getReportsAttendanceSummary: () => fetch(`${API_BASE}/reports/attendance-summary`).then(res => handleResponse<AttendanceSummaryReport>(res)),
  getReportExportUrl: (type: 'directory' | 'department' | 'attendance') => `${API_BASE}/reports/export/${type}`,

  // Settings
  getSettings: () => fetch(`${API_BASE}/settings`).then(res => handleResponse<CompanySettings>(res)),
  updateSettings: (data: Partial<CompanySettings>) =>
    fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<CompanySettings>(res)),
  resetSampleData: () =>
    fetch(`${API_BASE}/settings/reset-seed`, { method: 'POST' }).then(res => handleResponse<{ message: string }>(res))
};
