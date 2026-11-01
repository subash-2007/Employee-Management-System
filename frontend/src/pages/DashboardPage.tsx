import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserX, Building2, UserPlus, 
  DollarSign, TrendingUp, CalendarCheck, Clock, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats, Employee } from '../types';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';

const PIE_COLORS = ['#0066b2', '#0e86d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

interface DashboardPageProps {
  onNavigateToEmployees: () => void;
  onNavigateToAttendance: () => void;
  onViewEmployee: (empId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToEmployees,
  onNavigateToAttendance,
  onViewEmployee
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    api.getDashboardStats()
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load dashboard statistics', err))
      .finally(() => setLoading(false));
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Enterprise HR Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-brand-950/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/30 text-brand-200 border border-brand-400/20 mb-2">
            Auspify Technologies HRMS
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Executive Workforce Dashboard</h1>
          <p className="text-xs text-brand-100/80 mt-1 max-w-xl">
            Real-time human capital analytics, department allocation, recruitment trends, and daily attendance tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToEmployees}
            className="px-4 py-2 text-xs font-semibold bg-white text-brand-900 rounded-xl hover:bg-brand-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-brand-700" />
            Manage Employees
          </button>
          <button
            onClick={onNavigateToAttendance}
            className="px-4 py-2 text-xs font-semibold bg-brand-700 text-white rounded-xl hover:bg-brand-600 transition-colors border border-brand-500/30 flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4 text-brand-300" />
            Check Attendance
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Headcount"
          value={stats.total_employees}
          subtitle="Registered staff"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Staff"
          value={stats.active_employees}
          subtitle={`${Math.round((stats.active_employees / (stats.total_employees || 1)) * 100)}% active rate`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Inactive / On Leave"
          value={stats.inactive_employees + stats.on_leave_employees}
          subtitle={`${stats.on_leave_employees} currently on leave`}
          icon={UserX}
          color="amber"
        />
        <StatCard
          title="Departments"
          value={stats.total_departments}
          subtitle={`${stats.total_designations} active roles`}
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="New Joiners"
          value={stats.new_employees_this_month}
          subtitle="Joined this month"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.attendance_rate_today}%`}
          subtitle={`${stats.present_today} present today`}
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {/* Charts Section: Monthly Growth & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workforce Growth Trend</h3>
              <p className="text-xs text-slate-500">Monthly new employee onboarding trajectory</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">
              Historical Cohorts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthly_growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066b2" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0066b2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="New Hires" stroke="#0066b2" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Department Distribution</h3>
              <span className="text-xs text-slate-400">Headcount</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">Employee share by division</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.department_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {stats.department_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [`${val} staff`, item.payload.name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 max-h-28 overflow-y-auto text-xs pt-2 border-t border-slate-100">
            {stats.department_distribution.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="font-semibold text-slate-800">{d.count} staff</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Department Payroll & Employment Status / Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Budget Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Headcount & Payroll Allocation</h3>
              <p className="text-xs text-slate-500">Distribution of compensation across teams</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Total Payroll: </span>
              <span className="text-xs font-bold text-slate-900">${stats.total_payroll.toLocaleString()}</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.department_distribution} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#0066b2" 
                  tick={{ fontSize: 10, fill: '#0066b2' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'count' ? `${val} employees` : `$${Number(val).toLocaleString()}`,
                    name === 'count' ? 'Headcount' : 'Total Budget'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar yAxisId="left" dataKey="count" name="count" fill="#0066b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employment Type & Status Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Employment Breakdown</h3>
            <p className="text-xs text-slate-500">Contract types and active status overview</p>
          </div>

          {/* Status Progress bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Overview</h4>
            {stats.status_distribution.map(item => {
              const pct = Math.round((item.count / (stats.total_employees || 1)) * 100);
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.status}</span>
                    <span className="text-slate-500">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.status === 'Active' ? 'bg-emerald-500' :
                        item.status === 'On Leave' ? 'bg-amber-500' :
                        item.status === 'Inactive' ? 'bg-slate-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Employment Type grid */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Employment Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {stats.employment_type_distribution.map(et => (
                <div key={et.type} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block truncate">{et.type}</span>
                  <span className="text-base font-bold text-slate-800">{et.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Registrations Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Employee Registrations</h3>
            <p className="text-xs text-slate-500">Newly enrolled staff at Auspify Technologies</p>
          </div>
          <button
            onClick={onNavigateToEmployees}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            View all employees <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Employee ID</th>
                <th className="px-4 py-2.5 text-left">Staff Name</th>
                <th className="px-4 py-2.5 text-left">Department</th>
                <th className="px-4 py-2.5 text-left">Designation</th>
                <th className="px-4 py-2.5 text-left">Joining Date</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.recent_employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-brand-700">{emp.employee_code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                        {emp.full_name[0]}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 block">{emp.full_name}</span>
                        <span className="text-slate-400 text-3xs">{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{emp.department_name || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.designation_title || 'Unassigned'}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.joining_date}</td>
                  <td className="px-4 py-3"><Badge>{emp.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewEmployee(emp.id)}
                      className="px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
