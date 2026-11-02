import React, { useState } from 'react';
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
  MdDownload
} from 'react-icons/md';
import { showSuccessToast, showConfirmDialog } from '../utils/alerts';
import Swal from 'sweetalert2';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('offboarding'); // 'offboarding' | 'workspace'

  // Resignation & Exit Clearance Records
  const [exitCases, setExitCases] = useState([
    {
      id: 'EXIT-2026-012',
      emp: 'Pooja Verma',
      empId: 'AAYUP-EMP-2026-0041',
      role: 'Associate Frontend Developer',
      dept: 'Engineering',
      appliedOn: '18 Oct 2026',
      lastWorkingDay: '18 Nov 2026',
      noticePeriod: '30 Days',
      daysLeft: 15,
      reason: 'Pursuing Higher Studies (Master of Science abroad)',
      status: 'Clearance In Progress',
      clearances: {
        itAsset: true, // Laptop & charger returned
        financeDues: true, // No advance balance
        adminBadge: false, // RFID card return pending
        managerKT: true // Knowledge transfer to Rahul complete
      },
      settlementAmount: '₹ 54,200.00' // Gratuity + Unpaid Leave encashment
    },
    {
      id: 'EXIT-2026-011',
      emp: 'Saurabh Shukla',
      empId: 'AAYUP-EMP-2026-0038',
      role: 'QA Manual Tester',
      dept: 'Quality Assurance',
      appliedOn: '01 Oct 2026',
      lastWorkingDay: '31 Oct 2026',
      noticePeriod: '30 Days',
      daysLeft: 0,
      reason: 'Relocating to Bengaluru for personal reasons',
      status: 'Settlement Completed',
      clearances: {
        itAsset: true,
        financeDues: true,
        adminBadge: true,
        managerKT: true
      },
      settlementAmount: '₹ 42,800.00'
    }
  ]);

  const toggleClearance = (caseId, key) => {
    setExitCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const updated = {
          ...c,
          clearances: {
            ...c.clearances,
            [key]: !c.clearances[key]
          }
        };
        const allDone = Object.values(updated.clearances).every(v => v === true);
        if (allDone && updated.status !== 'Settlement Completed') {
          updated.status = 'Ready for F&F Settlement';
        }
        return updated;
      }
      return c;
    }));
  };

  const handleExecuteSettlement = (exitCase) => {
    Swal.fire({
      title: 'Disburse Full & Final (F&F) Settlement?',
      html: `All multi-department clearances are verified for <b>${exitCase.emp}</b>.<br/>Disburse final settlement voucher of <b>${exitCase.settlementAmount}</b> and generate Experience & Relieving Certificate?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Finalize & Issue Documents'
    }).then((result) => {
      if (result.isConfirmed) {
        setExitCases(prev => prev.map(c => c.id === exitCase.id ? { ...c, status: 'Settlement Completed' } : c));
        Swal.fire({
          icon: 'success',
          title: 'Exit Completed!',
          text: `F&F settlement voucher generated. Official Relieving & Service Letter dispatched to ${exitCase.emp}'s personal email.`,
          timer: 2200,
          showConfirmButton: false
        });
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
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Resignations</div>
                <div className="text-2xl font-black text-amber-500 mt-1">1 Employee</div>
                <div className="text-[11px] text-slate-500 font-medium">Serving Notice Period</div>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                <MdPendingActions className="text-xl" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">F&F Settlements Cleared</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">₹ 97,000</div>
                <div className="text-[11px] text-slate-500 font-medium">Gratuity & Leave Encashment</div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <MdAttachMoney className="text-xl" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">No-Dues Clearance Rate</div>
                <div className="text-2xl font-black text-blue-600 mt-1">100% Verified</div>
                <div className="text-[11px] text-slate-500 font-medium">IT, Finance, Admin & HR</div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <MdCheckCircle className="text-xl" />
              </div>
            </div>
          </div>

          {/* Offboarding Cases Pipeline */}
          <div className="space-y-4">
            {exitCases.map((exitCase) => {
              const allDone = Object.values(exitCase.clearances).every(Boolean);
              return (
                <div key={exitCase.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-sm flex items-center justify-center">
                        {exitCase.emp.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">{exitCase.emp}</h3>
                          <span className="font-mono text-xs font-bold text-blue-600">{exitCase.empId}</span>
                          <span className="text-xs text-slate-400">&bull; {exitCase.role} ({exitCase.dept})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Resignation Date: {exitCase.appliedOn} &bull; Last Working Day: <strong className="text-slate-800">{exitCase.lastWorkingDay}</strong> ({exitCase.daysLeft} Days remaining)
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      exitCase.status === 'Settlement Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      allDone ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {exitCase.status}
                    </span>
                  </div>

                  {/* Resignation Reason Box */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stated Reason for Resignation:</span>
                    <p className="text-slate-700 font-medium mt-0.5">{exitCase.reason}</p>
                  </div>

                  {/* 4-Pillar Departmental No-Dues Checklist */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
                      Multi-Departmental No-Dues Clearances
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      
                      {/* IT Asset */}
                      <button
                        onClick={() => toggleClearance(exitCase.id, 'itAsset')}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          exitCase.clearances.itAsset ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">1. IT Asset Return</span>
                          <span className="text-[10px] text-slate-500">Laptop & accessories</span>
                        </div>
                        {exitCase.clearances.itAsset ? <MdCheckCircle className="text-emerald-600 text-lg" /> : <MdCancel className="text-slate-300 text-lg" />}
                      </button>

                      {/* Finance Dues */}
                      <button
                        onClick={() => toggleClearance(exitCase.id, 'financeDues')}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          exitCase.clearances.financeDues ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">2. Finance & Loans</span>
                          <span className="text-[10px] text-slate-500">No advance balance</span>
                        </div>
                        {exitCase.clearances.financeDues ? <MdCheckCircle className="text-emerald-600 text-lg" /> : <MdCancel className="text-slate-300 text-lg" />}
                      </button>

                      {/* Admin Access Badge */}
                      <button
                        onClick={() => toggleClearance(exitCase.id, 'adminBadge')}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          exitCase.clearances.adminBadge ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">3. Facilities & RFID</span>
                          <span className="text-[10px] text-slate-500">Access card returned</span>
                        </div>
                        {exitCase.clearances.adminBadge ? <MdCheckCircle className="text-emerald-600 text-lg" /> : <MdCancel className="text-slate-300 text-lg" />}
                      </button>

                      {/* Manager KT */}
                      <button
                        onClick={() => toggleClearance(exitCase.id, 'managerKT')}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          exitCase.clearances.managerKT ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">4. Knowledge Transfer</span>
                          <span className="text-[10px] text-slate-500">Handover completed</span>
                        </div>
                        {exitCase.clearances.managerKT ? <MdCheckCircle className="text-emerald-600 text-lg" /> : <MdCancel className="text-slate-300 text-lg" />}
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
        <form onSubmit={(e) => { e.preventDefault(); showSuccessToast('Workspace settings saved.'); }} className="space-y-6 max-w-4xl">
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
                  defaultValue="Aayup Technologies Private Limited"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Office Location</label>
                <input
                  type="text"
                  defaultValue="Gomti Nagar, Lucknow, UP - 226010"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MdFingerprint className="text-blue-600 text-xl" />
              <h3 className="font-extrabold text-sm text-slate-900">Work Shift & Geofence Guardrails</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">General Shift In-Time</label>
                <input
                  type="text"
                  defaultValue="09:30 AM"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Out-Time</label>
                <input
                  type="text"
                  defaultValue="06:30 PM"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Late Grace Window</label>
                <input
                  type="text"
                  defaultValue="15 Minutes"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <MdSave className="text-base" />
              <span>Save Workspace Configuration</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
