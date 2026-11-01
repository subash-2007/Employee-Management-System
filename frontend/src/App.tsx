import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Building2, Award, CalendarCheck, 
  FileSpreadsheet, Settings, Menu, X, Bell, UserPlus, 
  CheckCircle, Database, ChevronRight, Shield
} from 'lucide-react';
import { api } from './services/api';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DesignationsPage } from './pages/DesignationsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmployeeProfileModal } from './components/EmployeeProfileModal';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { Department, Designation, Employee } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Quick modals accessible from topbar
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [viewProfileId, setViewProfileId] = useState<number | null>(null);

  // Aux data for quick add
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  useEffect(() => {
    checkHealth();
    loadAuxData();
  }, []);

  const checkHealth = async () => {
    try {
      await api.getHealth();
      setApiConnected(true);
    } catch {
      setApiConnected(false);
    }
  };

  const loadAuxData = async () => {
    try {
      const [depts, desigs] = await Promise.all([
        api.getDepartments(),
        api.getDesignations()
      ]);
      setDepartments(depts);
      setDesignations(desigs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAddEmployee = async (empData: Partial<Employee>) => {
    await api.createEmployee(empData);
    loadAuxData();
    setIsQuickAddOpen(false);
    setCurrentPage('employees');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'designations', label: 'Designations', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'reports', label: 'Employee Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-brand-500/20">
                A
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight block">AUSPIFY EMS</span>
                <span className="text-3xs text-brand-300 font-medium block">Enterprise HR Portal</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-3xs font-bold uppercase tracking-wider text-slate-500">
              Workforce Modules
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Workspace & Status */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-3xs font-semibold uppercase text-slate-400">Database Engine</span>
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            </div>
            <p className="font-medium text-slate-200 flex items-center gap-1.5 text-xs">
              <Database className="w-3.5 h-3.5 text-brand-400" /> SQLite (ems.db)
            </p>
            <p className="text-3xs text-slate-400 mt-0.5">Auspify Technologies Internship</p>
          </div>

          {/* Admin Avatar */}
          <div className="flex items-center space-x-3 px-1">
            <div className="w-8 h-8 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center">
              HR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">HR Administrator</p>
              <p className="text-3xs text-slate-400 truncate">hr@auspify.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-400">Auspify EMS</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-slate-800 capitalize">
                {navItems.find(n => n.id === currentPage)?.label || currentPage}
              </span>
            </div>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadAuxData();
                setIsQuickAddOpen(true);
              }}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Quick Register</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              API Connected
            </span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigateToEmployees={() => setCurrentPage('employees')}
              onNavigateToAttendance={() => setCurrentPage('attendance')}
              onViewEmployee={id => setViewProfileId(id)}
            />
          )}

          {currentPage === 'employees' && <EmployeesPage />}
          {currentPage === 'departments' && <DepartmentsPage />}
          {currentPage === 'designations' && <DesignationsPage />}
          {currentPage === 'attendance' && <AttendancePage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'settings' && (
            <SettingsPage onDataReset={() => loadAuxData()} />
          )}
        </main>
      </div>

      {/* Topbar Quick Add Employee Modal */}
      <EmployeeFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleQuickAddEmployee}
        departments={departments}
        designations={designations}
      />

      {/* Profile Modal triggered from dashboard or elsewhere */}
      <EmployeeProfileModal
        isOpen={Boolean(viewProfileId)}
        onClose={() => setViewProfileId(null)}
        employeeId={viewProfileId}
      />
    </div>
  );
};

export default App;
