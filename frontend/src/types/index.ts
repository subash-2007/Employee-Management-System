export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  head_name?: string;
  created_at: string;
  employee_count: number;
  designation_count: number;
}

export interface Designation {
  id: number;
  code: string;
  title: string;
  department_id: number;
  department_name?: string;
  description?: string;
  salary_grade?: string;
  min_salary: number;
  max_salary: number;
  created_at: string;
  employee_count: number;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_code?: string;
  employee_name?: string;
  department_name?: string;
  attendance_date: string;
  check_in?: string;
  check_out?: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave' | 'Late';
  notes?: string;
  created_at: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob?: string;
  address?: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  designation_id?: number;
  designation_title?: string;
  designation_code?: string;
  joining_date: string;
  employment_type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  created_at: string;
  updated_at: string;
}

export interface EmployeeDetail extends Employee {
  recent_attendance: AttendanceRecord[];
}

export interface EmployeeListResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: Employee[];
}

export interface DepartmentDistributionItem {
  name: string;
  count: number;
  total_salary: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface EmploymentTypeItem {
  type: string;
  count: number;
}

export interface MonthlyGrowthItem {
  month: string;
  count: number;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  on_leave_employees: number;
  total_departments: number;
  total_designations: number;
  new_employees_this_month: number;
  attendance_rate_today: number;
  present_today: number;
  absent_today: number;
  avg_salary: number;
  total_payroll: number;
  department_distribution: DepartmentDistributionItem[];
  status_distribution: StatusDistributionItem[];
  employment_type_distribution: EmploymentTypeItem[];
  monthly_growth: MonthlyGrowthItem[];
  recent_employees: Employee[];
}

export interface CompanySettings {
  id: number;
  company_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  working_hours: string;
  working_days: string;
  auto_emp_prefix: string;
  currency: string;
  theme: string;
  updated_at: string;
}

export interface DepartmentReportItem {
  department_code: string;
  department_name: string;
  department_head: string;
  total_employees: number;
  active_employees: number;
  total_salary_budget: number;
  average_salary: number;
}

export interface AttendanceSummaryReport {
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  half_day_count: number;
  on_leave_count: number;
  status_breakdown: Record<string, number>;
}
