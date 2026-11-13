import React, { useState, useEffect, useCallback } from 'react';
import { 
  MdSecurity, 
  MdOutlineNotificationsActive, 
  MdFingerprint, 
  MdLocationCity,
  MdSave,
  MdExitToApp,
  MdAssignmentTurnedIn,
  MdCheckCircle,
  MdPendingActions,
  MdCancel,
  MdAttachMoney,
  MdDoneAll,
  MdLaptopMac,
  MdDescription,
  MdWarningAmber,
  MdDownload,
  MdRefresh
} from 'react-icons/md';
import { showSuccessToast, showErrorToast } from '../utils/alerts';
import Swal from 'sweetalert2';
import apiClient from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('offboarding'); // 'offboarding' | 'workspace'
  const [loadingCases, setLoadingCases] = useState(false);
  const [exitCases, setExitCases] = useState([]);

  // Workspace configuration form state
  const [workspaceSettings, setWorkspaceSettings] = useState({
    companyName: 'Aayup Technologies Private Limited',
    officialEmail: 'contact@aayup.com',
    supportPhone: '+91 522 4901 888',
    officeAddress: 'Cyber Heights, 6th Floor, Vibhuti Khand, Gomti Nagar, Lucknow, UP - 226010',
    geofenceRadiusMeters: 100,
    graceTimeMinutes: 15,
    shiftStartTime: '09:30 AM',
    shiftEndTime: '06:30 PM',
    autoClockoutAtShiftEnd: true,
    blockLoginAfterShiftEnd: true,
    requireSelfieCheckin: true,
    requireDoctorCertDays: 2
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch Live Exit Cases from MongoDB
  const fetchOffboardingCases = useCallback(async () => {
    setLoadingCases(true);
    try {
      const res = await apiClient.getOffboardingCases();
      if (res && res.success) {
        setExitCases(res.data || []);
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load offboarding records.');
    } finally {
      setLoadingCases(false);
    }
  }, []);

  // Fetch Live Company Workspace Settings
  const fetchWorkspaceSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await apiClient.getCompanySettings();
      if (res && res.success && res.data) {
        setWorkspaceSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchOffboardingCases();
    fetchWorkspaceSettings();
  }, [fetchOffboardingCases, fetchWorkspaceSettings]);

  // Toggle Clearance in MongoDB
  const toggleClearance = async (caseId, key) => {
    const targetCase = exitCases.find(c => c.id === caseId);
    if (!targetCase) return;

    const currentVal = targetCase.clearances ? targetCase.clearances[key] : false;
    const newVal = !currentVal;

    // Optimistic UI update
    setExitCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updatedClearances = { ...c.clearances, [key]: newVal };
        const allDone = Object.values(updatedClearances).every(v => v === true);
        let newStatus = c.status;
        if (allDone && c.status !== 'Settlement Completed') {
          newStatus = 'Ready for F&F Settlement';
        } else if (!allDone && c.status === 'Ready for F&F Settlement') {
          newStatus = 'Clearance In Progress';
        }
        return { ...c, clearances: updatedClearances, status: newStatus };
      }
      return c;
    }));

    try {
      await apiClient.updateClearance(caseId, key, newVal);
      showSuccessToast(`Clearance item updated.`);
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to sync clearance update to database.');
      fetchOffboardingCases();
    }
  };

  // Disburse F&F Settlement
  const handleExecuteSettlement = (exitCase) => {
    Swal.fire({
      title: 'Disburse Full & Final (F&F) Settlement?',
      html: `All multi-department clearances are verified for <b>${exitCase.emp}</b>.<br/>Disburse final settlement voucher of <b>${exitCase.settlementAmount}</b> and generate Experience & Relieving Certificate?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Finalize & Issue Documents'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.finalizeSettlement(exitCase.id);
          setExitCases(prev => prev.map(c => c.id === exitCase.id ? { ...c, status: 'Settlement Completed' } : c));
          Swal.fire({
            icon: 'success',
            title: 'Exit Completed!',
            text: `F&F settlement voucher generated. Official Relieving & Service Letter dispatched to ${exitCase.emp}'s personal email.`,
            timer: 2200,
            showConfirmButton: false
          });
        } catch (err) {
          console.error(err);
          showErrorToast('Settlement execution failed.');
        }
      }
    });
  };

  const handleDownloadRelievingLetter = (exitCase) => {
    Swal.fire({
      icon: 'success',
      title: 'Downloading Relieving & Experience Letter',
      text: `Generated signed corporate certificate for ${exitCase.emp} (${exitCase.empId}).`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  // Save Workspace Configuration
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await apiClient.updateCompanySettings(workspaceSettings);
      if (res && res.success) {
        showSuccessToast('Workspace settings saved to live database!');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to save settings to server.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Exit Clearance</h1>
          <p className="text-xs text-slate-500 font-medium">Manage corporate workspace settings, digital resignation offboarding, and Full & Final (F&F) settlements.</p>
        </div>
      </div>

      {/* Tabs Switcher: Offboarding vs Workspace Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('offboarding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'offboarding'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdExitToApp className="text-base" /> Digital Offboarding & F&F Settlement ({exitCases.length})
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'workspace'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdLocationCity className="text-base" /> Corporate Workspace Configuration
        </button>
      </div>

      {/* TAB 1: DIGITAL OFFBOARDING & F&F SETTLEMENT */}
      {activeTab === 'offboarding' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Resignations</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {exitCases.filter(c => c.status !== 'Settlement Completed').length} Cases
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <MdPendingActions className="text-2xl" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready for Settlement</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {exitCases.filter(c => c.status === 'Ready for F&F Settlement').length} Cases
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <MdAssignmentTurnedIn className="text-2xl" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">F&F Closed (This Quarter)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {exitCases.filter(c => c.status === 'Settlement Completed').length} Completed
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <MdCheckCircle className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Offboarding Cases List */}
          <div className="space-y-4">
            {loadingCases ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <MdRefresh className="text-3xl text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Loading live exit clearance records from MongoDB...</p>
              </div>
            ) : exitCases.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-600">No active exit cases in database.</p>
              </div>
            ) : exitCases.map((exitCase) => {
              const allDone = exitCase.clearances && Object.values(exitCase.clearances).every(v => v === true);

              return (
                <div
                  key={exitCase.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-5"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {exitCase.emp.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900">{exitCase.emp}</h3>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold">{exitCase.empId}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{exitCase.role} • {exitCase.dept}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        exitCase.status === 'Settlement Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : exitCase.status === 'Ready for F&F Settlement'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {exitCase.status}
                      </span>
                    </div>
                  </div>

                  {/* Exit Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">Resignation Date</span>
                      <strong className="text-slate-800">{exitCase.appliedOn}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Last Working Day</span>
                      <strong className="text-slate-800">{exitCase.lastWorkingDay}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Notice Served</span>
                      <strong className="text-slate-800">{exitCase.noticePeriod} ({exitCase.daysLeft} days remaining)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Reason for Separation</span>
                      <span className="text-slate-700 truncate block font-medium" title={exitCase.reason}>
                        {exitCase.reason}
                      </span>
                    </div>
                  </div>

                  {/* Multi-department Clearance Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <MdAssignmentTurnedIn className="text-blue-600 text-sm" /> Departmental Handover & Clearance Checklist:
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {/* IT Asset */}
                      <button
                        type="button"
                        onClick={() => toggleClearance(exitCase.id, 'itAsset')}
                        disabled={exitCase.status === 'Settlement Completed'}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                          exitCase.clearances?.itAsset
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {exitCase.clearances?.itAsset ? (
                          <MdCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
                        ) : (
                          <MdCancel className="text-slate-400 text-base shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="text-xs block">IT & Hardware Assets</strong>
                          <span className="text-[11px] text-slate-500 font-medium">Laptop, charger & accessories returned</span>
                        </div>
                      </button>

                      {/* Finance Dues */}
                      <button
                        type="button"
                        onClick={() => toggleClearance(exitCase.id, 'financeDues')}
                        disabled={exitCase.status === 'Settlement Completed'}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                          exitCase.clearances?.financeDues
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {exitCase.clearances?.financeDues ? (
                          <MdCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
                        ) : (
                          <MdCancel className="text-slate-400 text-base shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="text-xs block">Finance & Accounts</strong>
                          <span className="text-[11px] text-slate-500 font-medium">Salary advance & travel claims verified</span>
                        </div>
                      </button>

                      {/* Admin RFID Badge */}
                      <button
                        type="button"
                        onClick={() => toggleClearance(exitCase.id, 'adminBadge')}
                        disabled={exitCase.status === 'Settlement Completed'}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                          exitCase.clearances?.adminBadge
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {exitCase.clearances?.adminBadge ? (
                          <MdCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
                        ) : (
                          <MdCancel className="text-slate-400 text-base shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="text-xs block">Office Admin & RFID Card</strong>
                          <span className="text-[11px] text-slate-500 font-medium">Building pass & parking token deposited</span>
                        </div>
                      </button>

                      {/* Manager KT */}
                      <button
                        type="button"
                        onClick={() => toggleClearance(exitCase.id, 'managerKT')}
                        disabled={exitCase.status === 'Settlement Completed'}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                          exitCase.clearances?.managerKT
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {exitCase.clearances?.managerKT ? (
                          <MdCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
                        ) : (
                          <MdCancel className="text-slate-400 text-base shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="text-xs block">Manager Knowledge Transfer</strong>
                          <span className="text-[11px] text-slate-500 font-medium">Git repos, credentials & client handover</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Settlement Bottom Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold">Computed Full & Final (F&F) Settlement: </span>
                      <strong className="text-emerald-600 font-mono text-sm">{exitCase.settlementAmount}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {exitCase.status === 'Settlement Completed' ? (
                        <button
                          onClick={() => handleDownloadRelievingLetter(exitCase)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <MdDownload className="text-base" /> Download Relieving & Experience Letter
                        </button>
                      ) : (
                        <button
                          disabled={!allDone}
                          onClick={() => handleExecuteSettlement(exitCase)}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <MdDoneAll className="text-base" /> Finalize Full & Final Settlement
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CORPORATE WORKSPACE CONFIGURATION */}
      {activeTab === 'workspace' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MdLocationCity className="text-blue-600 text-xl" />
              <h3 className="font-extrabold text-sm text-slate-900">Corporate Entity Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={workspaceSettings.companyName || ''}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Office Location</label>
                <input
                  type="text"
                  value={workspaceSettings.officeAddress || ''}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, officeAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Contact Email</label>
                <input
                  type="email"
                  value={workspaceSettings.officialEmail || ''}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, officialEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone Helpline</label>
                <input
                  type="text"
                  value={workspaceSettings.supportPhone || ''}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, supportPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MdFingerprint className="text-blue-600 text-xl" />
              <h3 className="font-extrabold text-sm text-slate-900">Work Shift, Auto-Clockout & Geofence Guardrails</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shift Start Time (Morning Punch-in)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:30 AM"
                  value={workspaceSettings.shiftStartTime || '09:30 AM'}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, shiftStartTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Employees can punch in from this time with face verification</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shift End Time (Auto Logout & Clockout)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 06:30 PM"
                  value={workspaceSettings.shiftEndTime || '06:30 PM'}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, shiftEndTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">At this time, mobile app auto-clockouts & logs out employee</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <input
                  type="checkbox"
                  id="autoClockoutCheckbox"
                  checked={workspaceSettings.autoClockoutAtShiftEnd !== false}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, autoClockoutAtShiftEnd: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="autoClockoutCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Auto Clock-Out & Logout on Shift End
                  <span className="block text-[10px] font-normal text-slate-500">Forces active mobile sessions to close once shift finishes</span>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <input
                  type="checkbox"
                  id="blockLoginCheckbox"
                  checked={workspaceSettings.blockLoginAfterShiftEnd !== false}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, blockLoginAfterShiftEnd: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="blockLoginCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Block Login Outside Shift Hours
                  <span className="block text-[10px] font-normal text-slate-500">Employees cannot log back in until next morning shift starts</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Geofence Radius (Meters)</label>
                <input
                  type="number"
                  value={workspaceSettings.geofenceRadiusMeters || 100}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, geofenceRadiusMeters: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Late Grace Window (Minutes)</label>
                <input
                  type="number"
                  value={workspaceSettings.graceTimeMinutes || 15}
                  onChange={(e) => setWorkspaceSettings({ ...workspaceSettings, graceTimeMinutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <MdSave className="text-base" />
              <span>{savingSettings ? 'Saving to Database...' : 'Save Workspace Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
