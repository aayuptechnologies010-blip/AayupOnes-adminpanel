import React, { useState } from 'react';
import { 
  MdAccessTime, 
  MdCheckCircle, 
  MdDevices,
  MdFileDownload,
  MdSearch,
  MdFilterList,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdFingerprint,
  MdHomeWork,
  MdWarningAmber,
  MdLocationOn,
  MdCameraAlt,
  MdCheck,
  MdClose,
  MdOutlineAssignmentLate,
  MdCalendarMonth,
  MdTune,
  MdRefresh
} from 'react-icons/md';
import { initialAttendanceLogs } from '../data/mockData';
import { showSuccessToast } from '../utils/alerts';
import Swal from 'sweetalert2';

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'regularizations' | 'geofence'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Regularization requests state (Syncs with Mobile App)
  const [regularizations, setRegularizations] = useState([
    {
      id: 'REG-1049',
      empId: 'AAYUP-EMP-2026-0024',
      name: 'Rahul Kumar',
      dept: 'Engineering',
      date: '23 Oct 2026',
      actualPunch: '10:05 AM (Late by 35m)',
      requestedIn: '09:30 AM',
      requestedOut: '06:30 PM',
      reason: 'Biometric Machine / Network Glitch',
      explanation: 'Office biometric scanner was showing offline status at Gomti Nagar ground floor.',
      status: 'Pending Review',
      appliedAt: '23 Oct, 10:15 AM'
    },
    {
      id: 'REG-1050',
      empId: 'AAYUP-EMP-2026-0031',
      name: 'Sneha Tiwari',
      dept: 'Design',
      date: '22 Oct 2026',
      actualPunch: 'Missed Punch-Out',
      requestedIn: '09:45 AM',
      requestedOut: '07:15 PM',
      reason: 'Client Meeting / On-Duty',
      explanation: 'Visited client office for UI design sprint review till late evening.',
      status: 'Pending Review',
      appliedAt: '23 Oct, 09:10 AM'
    },
    {
      id: 'REG-1048',
      empId: 'AAYUP-EMP-2026-0019',
      name: 'Amit Patel',
      dept: 'Quality Assurance',
      date: '21 Oct 2026',
      actualPunch: '10:20 AM',
      requestedIn: '09:30 AM',
      requestedOut: '06:30 PM',
      reason: 'Traffic Delay / Vehicle Breakdown',
      explanation: 'Metro service was delayed at Hazratganj station.',
      status: 'Approved',
      appliedAt: '21 Oct, 11:00 AM'
    }
  ]);

  // Geofence configuration state
  const [geofenceConfig, setGeofenceConfig] = useState({
    officeName: 'Lucknow HQ (Cyber Heights)',
    latitude: 26.8467,
    longitude: 80.9462,
    radiusMeters: 100,
    enforceGeofence: true,
    selfieVerification: true,
    graceMinutes: 15
  });

  const handleApproveRegularization = (reg) => {
    Swal.fire({
      title: 'Approve Attendance Regularization?',
      html: `Approve time correction for <b>${reg.name}</b> on <b>${reg.date}</b> to <b>${reg.requestedIn} - ${reg.requestedOut}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Approve & Mark Present'
    }).then((result) => {
      if (result.isConfirmed) {
        setRegularizations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'Approved' } : r));
        Swal.fire({
          icon: 'success',
          title: 'Regularization Approved!',
          text: `Attendance for ${reg.name} updated to On-Time Present. Sync notice sent to Mobile App.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleRejectRegularization = (reg) => {
    Swal.fire({
      title: 'Reject Regularization Request',
      input: 'textarea',
      inputLabel: 'Reason for Rejection',
      inputPlaceholder: 'e.g. Unverified explanation or excessive frequency.',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Reject Request',
      inputValidator: (value) => {
        if (!value) return 'Please provide rejection remarks!';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setRegularizations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'Rejected' } : r));
        Swal.fire({
          icon: 'info',
          title: 'Request Rejected',
          text: `Notification sent to ${reg.name} with HR remarks.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const filtered = initialAttendanceLogs.filter((log) => {
    const matchesSearch = 
      log.emp.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.mode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    showSuccessToast('Monthly Attendance CSV exported successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Time, Attendance & Geofence</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time daily punches, GPS geofenced mobile check-ins, and biometric sync.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <MdFileDownload className="text-base" />
            <span>Export Timesheet (CSV)</span>
          </button>
        </div>
      </div>

      {/* Top Shift Metrics Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Office</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">34</div>
            <div className="text-[11px] text-slate-500 font-medium">Inside 100m Geofence</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdCheckCircle className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remote (WFH)</div>
            <div className="text-2xl font-black text-blue-600 mt-1">4</div>
            <div className="text-[11px] text-slate-500 font-medium">Selfie & GPS Verified</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdHomeWork className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regularizations</div>
            <div className="text-2xl font-black text-amber-500 mt-1">2 Pending</div>
            <div className="text-[11px] text-slate-500 font-medium">From Mobile App</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <MdAccessTime className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</div>
            <div className="text-2xl font-black text-rose-500 mt-1">2</div>
            <div className="text-[11px] text-slate-500 font-medium">Beyond 15m Grace</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
            <MdWarningAmber className="text-xl" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Feed vs Regularization vs Geofence Setup */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'feed'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdFingerprint className="text-base" /> Daily Master Attendance Feed
        </button>
        <button
          onClick={() => setActiveTab('regularizations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'regularizations'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdOutlineAssignmentLate className="text-base" /> Regularization Requests (2)
        </button>
        <button
          onClick={() => setActiveTab('geofence')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'geofence'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdLocationOn className="text-base" /> Geofence & Mobile Rules
        </button>
      </div>

      {/* TAB 1: MASTER ATTENDANCE FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search employee, ID or mode..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <MdFilterList className="text-slate-700 text-base" /> Status:
              </span>
              {['All', 'Present', 'WFH', 'Late Arrival', 'On Leave'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Today's Attendance Master Feed</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Biometric & GPS Synced
              </span>
            </div>

            <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Shift Window</th>
                    <th className="px-6 py-3.5">First In</th>
                    <th className="px-6 py-3.5">Effective Hours</th>
                    <th className="px-6 py-3.5">Punch Source & Verification</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-extrabold text-xs">
                          {log.avatar}
                        </span>
                        <div>
                          <div className="text-slate-900 font-extrabold">{log.emp}</div>
                          <div className="text-[11px] text-slate-400 font-mono font-medium">{log.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{log.shift}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{log.in}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{log.hours}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          {log.mode.includes('Mobile') ? (
                            <span className="text-blue-600 flex items-center gap-1 font-bold">
                              <MdDevices /> App (Selfie & GPS)
                            </span>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-1 font-bold">
                              <MdFingerprint /> Office Biometric
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            log.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.status === 'WFH'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : log.status === 'Late Arrival'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
              <div>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                >
                  <MdKeyboardArrowLeft className="text-lg" />
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                >
                  <MdKeyboardArrowRight className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGULARIZATION REQUESTS (SYNCED WITH MOBILE APP) */}
      {activeTab === 'regularizations' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Mobile App Regularization Inbox</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                  2 Pending Actions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Employees can submit missed punches or late arrival explanations directly from the mobile app. Approving auto-corrects attendance & payroll.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {regularizations.map((reg) => (
              <div key={reg.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-sm flex items-center justify-center">
                      {reg.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">{reg.name}</h4>
                        <span className="font-mono text-[11px] text-blue-600 font-bold">{reg.empId}</span>
                        <span className="text-xs text-slate-400">&bull; {reg.dept}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Applied: {reg.appliedAt}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    reg.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    reg.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {reg.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-semibold">Incident Date:</span>
                    <span className="font-bold text-slate-800">{reg.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Actual Swipe Recorded:</span>
                    <span className="font-bold text-rose-600 font-mono">{reg.actualPunch}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Requested Timings:</span>
                    <span className="font-bold text-emerald-600 font-mono">{reg.requestedIn} &rarr; {reg.requestedOut}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Reason Category:</span>
                    <span className="font-bold text-slate-800">{reg.reason}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Employee Explanation:</span>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">{reg.explanation}</p>
                </div>

                {reg.status === 'Pending Review' && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      onClick={() => handleRejectRegularization(reg)}
                      className="px-4 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      <MdClose /> Reject
                    </button>
                    <button
                      onClick={() => handleApproveRegularization(reg)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1"
                    >
                      <MdCheck /> Approve & Correct Punch
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GEOFENCE & MOBILE RULES */}
      {activeTab === 'geofence' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Office Geofence & Mobile Check-in Configuration</h3>
            <p className="text-xs text-slate-500">Configure GPS radius boundaries and photo verification rules for the AayupOnes Mobile App.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Office Location Name</label>
                <input
                  type="text"
                  value={geofenceConfig.officeName}
                  onChange={(e) => setGeofenceConfig({ ...geofenceConfig, officeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={geofenceConfig.latitude}
                    onChange={(e) => setGeofenceConfig({ ...geofenceConfig, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={geofenceConfig.longitude}
                    onChange={(e) => setGeofenceConfig({ ...geofenceConfig, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Geofence Allowed Radius (Meters)</label>
                <input
                  type="number"
                  value={geofenceConfig.radiusMeters}
                  onChange={(e) => setGeofenceConfig({ ...geofenceConfig, radiusMeters: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Employees within 100 meters can punch via mobile app without proxy.</span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Mobile Verification Guardrails</h4>
              
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Enforce GPS Geofence Check</span>
                  <span className="text-[11px] text-slate-500">Block punch if employee is outside the 100m perimeter</span>
                </div>
                <input
                  type="checkbox"
                  checked={geofenceConfig.enforceGeofence}
                  onChange={(e) => setGeofenceConfig({ ...geofenceConfig, enforceGeofence: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Selfie / Face Liveness Verification</span>
                  <span className="text-[11px] text-slate-500">Capture quick camera selfie during mobile check-in</span>
                </div>
                <input
                  type="checkbox"
                  checked={geofenceConfig.selfieVerification}
                  onChange={(e) => setGeofenceConfig({ ...geofenceConfig, selfieVerification: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Late Grace Window (Minutes)</label>
                <input
                  type="number"
                  value={geofenceConfig.graceMinutes}
                  onChange={(e) => setGeofenceConfig({ ...geofenceConfig, graceMinutes: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Employees arriving within 15 minutes of shift start won't be flagged late.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => showSuccessToast('Geofence & Mobile rules updated and deployed to all apps!')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <MdTune className="text-base" /> Save & Push Rules to Mobile App
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
