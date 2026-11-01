import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Plus, Clock, Users, UserCheck, 
  UserX, AlertCircle, Calendar, Filter, CheckCircle2, 
  Trash2, Download
} from 'lucide-react';
import { api } from '../services/api';
import { AttendanceRecord, Employee } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    employee_id: '' as string | number,
    attendance_date: new Date().toISOString().split('T')[0],
    check_in: '09:00 AM',
    check_out: '06:00 PM',
    status: 'Present' as 'Present' | 'Absent' | 'Half Day' | 'On Leave' | 'Late',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate, selectedStatus, selectedEmpId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadEmployees = async () => {
    try {
      const res = await api.getEmployees({ limit: 100, status: 'Active' });
      setEmployees(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendance({
        attendance_date: selectedDate || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        employee_id: selectedEmpId !== 'all' ? Number(selectedEmpId) : undefined
      });
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMarkToday = async () => {
    try {
      const res = await api.quickMarkToday('Present');
      showToast(res.message);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      loadAttendance();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceForm.employee_id) {
      alert('Please select an employee');
      return;
    }

    setSubmitting(true);
    try {
      await api.markAttendance({
        ...attendanceForm,
        employee_id: Number(attendanceForm.employee_id)
      });
      showToast('Attendance recorded successfully');
      setIsModalOpen(false);
      loadAttendance();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Delete this attendance entry?')) return;
    try {
      await api.deleteAttendance(id);
      showToast('Attendance entry deleted');
      loadAttendance();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Metrics for current viewed list
  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const onLeaveCount = records.filter(r => r.status === 'On Leave' || r.status === 'Half Day').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance & Shift Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log daily check-in / check-out times, present/absent statuses, and shift notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleQuickMarkToday}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl hover:bg-emerald-100 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Quick Mark All Active Present
          </button>
          <button
            onClick={() => {
              setAttendanceForm({
                employee_id: employees[0]?.id || '',
                attendance_date: selectedDate || new Date().toISOString().split('T')[0],
                check_in: '09:00 AM',
                check_out: '06:00 PM',
                status: 'Present',
                notes: ''
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Record Entry
          </button>
        </div>
      </div>

      {/* Metric summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs uppercase font-bold text-slate-400">Present Today</p>
            <h4 className="text-xl font-bold text-slate-900">{presentCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs uppercase font-bold text-slate-400">Late Arrival</p>
            <h4 className="text-xl font-bold text-slate-900">{lateCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs uppercase font-bold text-slate-400">Absent</p>
            <h4 className="text-xl font-bold text-slate-900">{absentCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xs uppercase font-bold text-slate-400">On Leave / Half Day</p>
            <h4 className="text-xl font-bold text-slate-900">{onLeaveCount}</h4>
          </div>
        </div>
      </div>

      {/* Date & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Quick "Today" / "All Dates" */}
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate('')}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors ${
              !selectedDate ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            All Dates History
          </button>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Staff:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-[180px]"
            >
              <option value="all">All Employees</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CSV Export for Attendance */}
        <a
          href={api.getReportExportUrl('attendance')}
          download
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          Export Attendance CSV
        </a>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading attendance records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No attendance records found</h3>
            <p className="text-xs text-slate-400">
              {selectedDate ? `No records logged for ${selectedDate}.` : 'Select a date or click Quick Mark.'}
            </p>
            <button
              onClick={handleQuickMarkToday}
              className="mt-2 px-3.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              Mark Today's Attendance
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Check In</th>
                  <th className="px-4 py-3 text-left">Check Out</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Notes / Justification</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {r.attendance_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <span className="font-bold text-slate-900 block">{r.employee_name}</span>
                        <span className="text-brand-700 font-medium text-3xs">{r.employee_code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {r.department_name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                      {r.check_in || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                      {r.check_out || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {r.notes || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        title="Delete Entry"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Staff Attendance"
        subtitle="Log employee shift timings and daily status"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select Employee *</label>
            <select
              value={attendanceForm.employee_id}
              onChange={e => setAttendanceForm({ ...attendanceForm, employee_id: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Attendance Date *</label>
            <input
              type="date"
              value={attendanceForm.attendance_date}
              onChange={e => setAttendanceForm({ ...attendanceForm, attendance_date: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Check-In Time</label>
              <input
                type="text"
                value={attendanceForm.check_in}
                onChange={e => setAttendanceForm({ ...attendanceForm, check_in: e.target.value })}
                placeholder="09:00 AM"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Check-Out Time</label>
              <input
                type="text"
                value={attendanceForm.check_out}
                onChange={e => setAttendanceForm({ ...attendanceForm, check_out: e.target.value })}
                placeholder="06:00 PM"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Attendance Status *</label>
            <select
              value={attendanceForm.status}
              onChange={e => setAttendanceForm({ ...attendanceForm, status: e.target.value as any })}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Present">Present</option>
              <option value="Late">Late Arrival</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave (Approved)</option>
              <option value="Absent">Absent (Unexcused)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={attendanceForm.notes}
              onChange={e => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
              placeholder="e.g. Remote work, doctor appointment, overtime..."
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
              {submitting ? 'Recording...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
