import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, Printer, Users, Building2, 
  CalendarCheck, Clock, CheckCircle2, TrendingUp, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { 
  Employee, DepartmentReportItem, AttendanceSummaryReport 
} from '../types';
import { Badge } from '../components/Badge';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'department' | 'new_joiners' | 'status' | 'attendance'>('directory');
  const [loading, setLoading] = useState(false);

  // Data states
  const [directoryData, setDirectoryData] = useState<Employee[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentReportItem[]>([]);
  const [newJoinersData, setNewJoinersData] = useState<Employee[]>([]);
  const [statusData, setStatusData] = useState<Record<string, { count: number; total_salary: number; employees: Employee[] }>>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceSummaryReport | null>(null);

  // Filter for new joiners
  const [newJoinerDays, setNewJoinerDays] = useState<number>(90);

  useEffect(() => {
    loadActiveReport();
  }, [activeTab, newJoinerDays]);

  const loadActiveReport = async () => {
    setLoading(true);
    try {
      if (activeTab === 'directory') {
        const data = await api.getReportsDirectory();
        setDirectoryData(data);
      } else if (activeTab === 'department') {
        const data = await api.getReportsDepartments();
        setDepartmentData(data);
      } else if (activeTab === 'new_joiners') {
        const data = await api.getReportsNewJoiners(newJoinerDays);
        setNewJoinersData(data);
      } else if (activeTab === 'status') {
        const data = await api.getReportsActiveInactive();
        setStatusData(data);
      } else if (activeTab === 'attendance') {
        const data = await api.getReportsAttendanceSummary();
        setAttendanceData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive HR Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Exportable compliance directories, department payroll summaries, and attendance audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Print Report
          </button>
          <a
            href={
              activeTab === 'department'
                ? api.getReportExportUrl('department')
                : activeTab === 'attendance'
                ? api.getReportExportUrl('attendance')
                : api.getExportEmployeesCsvUrl()
            }
            download
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Selected CSV
          </a>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'directory'
              ? 'border-brand-600 text-brand-700 bg-brand-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Employee Directory
        </button>

        <button
          onClick={() => setActiveTab('department')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'department'
              ? 'border-brand-600 text-brand-700 bg-brand-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Department Payroll Report
        </button>

        <button
          onClick={() => setActiveTab('new_joiners')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'new_joiners'
              ? 'border-brand-600 text-brand-700 bg-brand-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          New Joiners Report
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'status'
              ? 'border-brand-600 text-brand-700 bg-brand-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Active vs Inactive Breakdown
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'border-brand-600 text-brand-700 bg-brand-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Attendance Audit Summary
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Compiling report data...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: EMPLOYEE DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Complete Employee Directory</h3>
                  <p className="text-xs text-slate-500">Comprehensive roster of all {directoryData.length} staff records</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left">Emp Code</th>
                      <th className="px-3.5 py-2.5 text-left">Full Name</th>
                      <th className="px-3.5 py-2.5 text-left">Email</th>
                      <th className="px-3.5 py-2.5 text-left">Phone</th>
                      <th className="px-3.5 py-2.5 text-left">Department</th>
                      <th className="px-3.5 py-2.5 text-left">Designation</th>
                      <th className="px-3.5 py-2.5 text-left">Joined</th>
                      <th className="px-3.5 py-2.5 text-left">Type</th>
                      <th className="px-3.5 py-2.5 text-left">Salary</th>
                      <th className="px-3.5 py-2.5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {directoryData.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/60">
                        <td className="px-3.5 py-2.5 font-semibold text-brand-700">{e.employee_code}</td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">{e.full_name}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{e.email}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{e.phone}</td>
                        <td className="px-3.5 py-2.5">{e.department_name}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{e.designation_title}</td>
                        <td className="px-3.5 py-2.5 text-slate-500">{e.joining_date}</td>
                        <td className="px-3.5 py-2.5">{e.employment_type}</td>
                        <td className="px-3.5 py-2.5 font-semibold text-slate-800">${e.salary.toLocaleString()}</td>
                        <td className="px-3.5 py-2.5"><Badge>{e.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENT REPORT */}
          {activeTab === 'department' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">Department Workforce & Budget Summary</h3>
                <p className="text-xs text-slate-500">Department-wise headcount, active staff ratio, and financial compensation commitments</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">Dept Code</th>
                      <th className="px-4 py-3 text-left">Department Name</th>
                      <th className="px-4 py-3 text-left">Department Head</th>
                      <th className="px-4 py-3 text-left">Total Staff</th>
                      <th className="px-4 py-3 text-left">Active Staff</th>
                      <th className="px-4 py-3 text-left">Total Salary Budget</th>
                      <th className="px-4 py-3 text-left">Average Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {departmentData.map(d => (
                      <tr key={d.department_code} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-brand-700">{d.department_code}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{d.department_name}</td>
                        <td className="px-4 py-3 text-slate-600">{d.department_head}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{d.total_employees}</td>
                        <td className="px-4 py-3 text-emerald-700 font-medium">{d.active_employees}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">${d.total_salary_budget.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">${d.average_salary.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NEW JOINERS */}
          {activeTab === 'new_joiners' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">New Employee Cohort Report</h3>
                  <p className="text-xs text-slate-500">Personnel enrolled within the recent onboarding window</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Timeframe:</span>
                  <select
                    value={newJoinerDays}
                    onChange={e => setNewJoinerDays(Number(e.target.value))}
                    className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value={30}>Last 30 Days</option>
                    <option value={60}>Last 60 Days</option>
                    <option value={90}>Last 90 Days</option>
                    <option value={180}>Last 6 Months</option>
                    <option value={365}>Last 1 Year</option>
                  </select>
                </div>
              </div>

              {newJoinersData.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center">No new employees joined in this timeframe.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Employee ID</th>
                        <th className="px-4 py-2.5 text-left">Full Name</th>
                        <th className="px-4 py-2.5 text-left">Department</th>
                        <th className="px-4 py-2.5 text-left">Designation</th>
                        <th className="px-4 py-2.5 text-left">Joining Date</th>
                        <th className="px-4 py-2.5 text-left">Salary</th>
                        <th className="px-4 py-2.5 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {newJoinersData.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-semibold text-brand-700">{e.employee_code}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-900">{e.full_name}</td>
                          <td className="px-4 py-2.5">{e.department_name}</td>
                          <td className="px-4 py-2.5 text-slate-600">{e.designation_title}</td>
                          <td className="px-4 py-2.5 font-medium text-emerald-700">{e.joining_date}</td>
                          <td className="px-4 py-2.5 font-semibold">${e.salary.toLocaleString()}</td>
                          <td className="px-4 py-2.5"><Badge>{e.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVE VS INACTIVE BREAKDOWN */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {Object.entries(statusData).map(([statusKey, info]) => (
                  <div key={statusKey} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-500">{statusKey}</span>
                      <Badge>{statusKey}</Badge>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-2xl font-bold text-slate-900">{info.count}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Payroll: ${info.total_salary.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status details table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Inactive & On-Leave Personnel Registry</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Code</th>
                        <th className="px-4 py-2.5 text-left">Name</th>
                        <th className="px-4 py-2.5 text-left">Department</th>
                        <th className="px-4 py-2.5 text-left">Role</th>
                        <th className="px-4 py-2.5 text-left">Status</th>
                        <th className="px-4 py-2.5 text-left">Contact Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {[...(statusData['Inactive']?.employees || []), ...(statusData['On Leave']?.employees || [])].map(e => (
                        <tr key={e.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-semibold text-brand-700">{e.employee_code}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-900">{e.full_name}</td>
                          <td className="px-4 py-2.5">{e.department_name}</td>
                          <td className="px-4 py-2.5 text-slate-600">{e.designation_title}</td>
                          <td className="px-4 py-2.5"><Badge>{e.status}</Badge></td>
                          <td className="px-4 py-2.5 text-slate-500">{e.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ATTENDANCE SUMMARY */}
          {activeTab === 'attendance' && attendanceData && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historical Attendance Audit Summary</h3>
                <p className="text-xs text-slate-500">Cumulative shift statistics across all registered entries</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">Total Entries Logged</span>
                  <h4 className="text-xl font-bold text-slate-900 mt-1">{attendanceData.total_records}</h4>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs text-emerald-700">Present Shifts</span>
                  <h4 className="text-xl font-bold text-emerald-800 mt-1">{attendanceData.present_count}</h4>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-xs text-amber-700">Late Arrivals</span>
                  <h4 className="text-xl font-bold text-amber-800 mt-1">{attendanceData.late_count}</h4>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                  <span className="text-xs text-rose-700">Absent Days</span>
                  <h4 className="text-xl font-bold text-rose-800 mt-1">{attendanceData.absent_count}</h4>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-xs text-indigo-700">Approved Leaves</span>
                  <h4 className="text-xl font-bold text-indigo-800 mt-1">{attendanceData.on_leave_count}</h4>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Audit Compliance Note</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Shift attendance audits comply with corporate working hour requirements (09:00 AM - 06:00 PM). 
                  Export the full CSV logs anytime to perform payroll deductions or external tax accounting reconciliation.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
