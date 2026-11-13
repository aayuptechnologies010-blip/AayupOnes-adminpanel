import React, { useState, useEffect } from 'react';
import { 
  MdCampaign, MdSend, MdGroups, MdPerson, MdApartment, 
  MdNotificationsActive, MdCheckCircle, MdHistory, MdOpenInNew,
  MdInfo, MdTrendingUp, MdSchedule
} from 'react-icons/md';
import Swal from 'sweetalert2';
import apiClient from '../services/api';

export default function Announcements() {
  const [targetType, setTargetType] = useState('ALL'); // 'ALL', 'DEPARTMENT', 'INDIVIDUAL'
  const [department, setDepartment] = useState('All');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [route, setRoute] = useState('home');
  const [sendPush, setSendPush] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [employeesList, setEmployeesList] = useState([]);
  const [announcementsLog, setAnnouncementsLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const departments = [
    'All',
    'Engineering',
    'Core Engineering',
    'Product Design',
    'QA & Testing',
    'People & HR',
    'Operations',
    'Marketing'
  ];

  const targetRoutes = [
    { key: 'home', label: '🏠 App Home Dashboard' },
    { key: 'onboarding', label: '📋 Onboarding Verification Form' },
    { key: 'attendance', label: '⏱️ Attendance & Daily Clock In/Out' },
    { key: 'leave', label: '🏖️ Leave Management & Apply Leave' },
    { key: 'work', label: '💼 Work & Assigned Tasks' },
    { key: 'payslips', label: '💰 Salary Payslips' },
    { key: 'helpdesk', label: '🎧 Internal Helpdesk' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [empRes, annRes] = await Promise.all([
        apiClient.getEmployees({ limit: 200 }).catch(() => ({ employees: [] })),
        apiClient.getAnnouncements().catch(() => ({ data: [] }))
      ]);

      setEmployeesList(empRes.employees || []);
      setAnnouncementsLog(annRes.data || []);
    } catch (err) {
      console.error('Error fetching announcement data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeToggle = (empId) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter both an Announcement Title and Message body.'
      });
      return;
    }

    if (targetType === 'INDIVIDUAL' && selectedEmployees.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Employee Selected',
        text: 'Please select at least one employee from the list.'
      });
      return;
    }

    const confirmRes = await Swal.fire({
      title: 'Broadcast Announcement?',
      html: `You are about to dispatch this announcement to <b>${
        targetType === 'ALL'
          ? 'ALL Employees'
          : targetType === 'DEPARTMENT'
          ? `Department: ${department}`
          : `${selectedEmployees.length} Selected Employee(s)`
      }</b> with high-priority FCM notification.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Send Now!'
    });

    if (!confirmRes.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        targetType,
        department,
        targetEmployeeIds: selectedEmployees,
        route,
        sendPush
      };

      const res = await apiClient.broadcastAnnouncement(payload);

      Swal.fire({
        icon: 'success',
        title: 'Dispatched Successfully! 🚀',
        html: `<p class="text-sm">${res.message || 'Notification sent!'}</p>
               <div class="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border text-left font-mono">
                 • Targeted: <b>${res.details?.totalTargeted || 0}</b><br/>
                 • In-App Created: <b>${res.details?.inAppCreated || 0}</b><br/>
                 • FCM Push Dispatched: <b>${res.details?.pushDispatched || 0}</b>
               </div>`
      });

      setTitle('');
      setMessage('');
      setSelectedEmployees([]);
      fetchInitialData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Broadcast Failed',
        text: err.message || 'Could not send announcement.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <MdNotificationsActive className="text-sm" /> Superadmin Push Hub
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            Enterprise Announcements & Push Notifications
          </h1>
          <p className="text-sm text-blue-100 mt-2 font-medium">
            Broadcast official announcements to all staff or targeted employees. Notifications arrive in the mobile notification bar even when the app is in background or closed.
          </p>
        </div>
        <MdCampaign className="absolute -right-6 -bottom-8 text-white/10 text-[180px] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Composer */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
              <MdCampaign />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Compose Announcement</h2>
              <p className="text-xs text-slate-500">Configure target audience and message details</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-5">
            {/* 1. Target Audience Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                1. Select Target Audience
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'ALL', label: 'All Employees', icon: MdGroups, desc: 'Broadcast everywhere' },
                  { id: 'DEPARTMENT', label: 'By Department', icon: MdApartment, desc: 'Specific teams' },
                  { id: 'INDIVIDUAL', label: 'Target Individuals', icon: MdPerson, desc: 'Select specific' },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = targetType === t.id;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTargetType(t.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Icon className={`text-xl mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="text-xs font-bold block">{t.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{t.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Department Dropdown if DEPARTMENT selected */}
            {targetType === 'DEPARTMENT' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Individual Employee Multi-select if INDIVIDUAL selected */}
            {targetType === 'INDIVIDUAL' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Select Employees ({selectedEmployees.length} selected):</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEmployees(selectedEmployees.length === employeesList.length ? [] : employeesList.map(e => e.id))}
                    className="text-blue-600 hover:underline font-bold text-[11px]"
                  >
                    {selectedEmployees.length === employeesList.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {employeesList.map((emp) => {
                    const isChecked = selectedEmployees.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => handleEmployeeToggle(emp.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                          isChecked ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-blue-600"
                          />
                          <span>{emp.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({emp.id})</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{emp.dept}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Message Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                2. Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Critical Update: Server Maintenance Tonight"
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 3. Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                3. Announcement Message / Instructions
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full message details. Employees will see this in the app notifications inbox and system tray."
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 4. Target Action on Notification Tap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  4. Action on Notification Click
                </label>
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {targetRoutes.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* FCM Push toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Delivery Channels
                </label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="pushToggle"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="pushToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Enable Real FCM Background Push Notification
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Broadcasting notification...</span>
                ) : (
                  <>
                    <MdSend className="text-base" /> Broadcast Announcement Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Preview & Recent Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mobile Push Preview */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Live Lock-screen Push Preview
            </span>
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center text-[10px] font-black">
                  A
                </div>
                <span className="text-[11px] font-bold text-slate-300">AayupOnes HRMS</span>
                <span className="text-[10px] text-slate-400 ml-auto">Now</span>
              </div>
              <h4 className="text-xs font-extrabold text-white">
                {title.trim() || 'Announcement Title Preview'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                {message.trim() || 'Your message body will be displayed here in Android & iOS push notification banner...'}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-blue-400 font-bold">
                <span>Opens: {targetRoutes.find(r => r.key === route)?.label || 'App Home'}</span>
                <span>Tap to view &rarr;</span>
              </div>
            </div>
          </div>

          {/* Recent Broadcasts Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MdHistory className="text-base text-blue-600" /> Recent Announcements History
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">({announcementsLog.length})</span>
            </div>

            {announcementsLog.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No announcement history logged yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {announcementsLog.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900 line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Recent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{item.desc}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        Route: {item.route || 'home'}
                      </span>
                      <span className="text-slate-400 font-medium">To: {item.employeeId || 'Broadcast'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

