import React, { useState, useEffect, useCallback } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdCheck, 
  MdClose, 
  MdDoneAll,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdAssignmentTurnedIn,
  MdHourglassTop,
  MdTaskAlt,
  MdCancel,
  MdVisibility,
  MdCalendarMonth,
  MdBeachAccess,
  MdMedicalServices,
  MdHomeWork,
  MdTune,
  MdShield,
  MdRefresh
} from 'react-icons/md';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alerts';
import Swal from 'sweetalert2';
import apiClient from '../services/api';

const Approvals = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'policy' | 'teamRadar'
  const [approvals, setApprovals] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const pageSize = 8;

  // Leave policies engine state
  const [leavePolicies, setLeavePolicies] = useState({
    annualCL: 12,
    annualSL: 8,
    monthlyWFHQuota: 2,
    carryForwardLimit: 8,
    probationLeaveAllowed: true,
    requireDoctorCertificateBeyondDays: 2
  });

  // Fetch approvals data from API / MongoDB
  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getApprovals({
        search,
        status: statusFilter,
        page: currentPage,
        limit: pageSize
      });

      if (res && res.success) {
        // Backend returns approvals under res.approvals or res.data
        const items = res.approvals || res.data || [];
        setApprovals(items);
        if (res.counts) {
          setCounts(res.counts);
        }
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
      showErrorToast('Failed to load live approvals from database.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage, pageSize]);

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    try {
      const res = await apiClient.getLeavePolicies();
      if (res && res.success && res.data) {
        setLeavePolicies(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch custom leave policies, keeping defaults:', err);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Client-side quick filter in case API returns list
  const filtered = approvals.filter((item) => {
    const s = search.toLowerCase();
    const matchesSearch = 
      (item.emp || '').toLowerCase().includes(s) ||
      (item.type || '').toLowerCase().includes(s) ||
      (item.id || '').toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const pendingCount = counts.pending ?? approvals.filter(a => a.status === 'Pending').length;
  const approvedCount = counts.approved ?? approvals.filter(a => a.status === 'Approved').length;
  const rejectedCount = counts.rejected ?? approvals.filter(a => a.status === 'Rejected').length;
  const totalCount = counts.total ?? approvals.length;

  const handleApprove = async (item) => {
    const res = await showConfirmDialog({
      title: 'Approve Leave Request?',
      text: `Grant approval for ${item.type} applied by ${item.emp} for ${item.dates}?`
    });

    if (res.isConfirmed) {
      try {
        const idToUse = item.rawId || item.id;
        const resp = await apiClient.approveApproval(idToUse);
        if (resp && resp.success) {
          showSuccessToast(`${item.type} approved for ${item.emp}! Notice pushed to Mobile App.`);
          fetchApprovals();
        } else {
          showErrorToast(resp?.message || 'Could not approve request.');
        }
      } catch (err) {
        console.error(err);
        showErrorToast('Error connecting to approvals API.');
      }
    }
  };

  const handleReject = async (item) => {
    Swal.fire({
      title: 'Reject Leave Request',
      input: 'textarea',
      inputLabel: 'Reason for Declining',
      inputPlaceholder: 'e.g. Critical sprint release scheduled on these dates.',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Decline Request',
      inputValidator: (value) => {
        if (!value) return 'Please mention a reason for the employee!';
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const idToUse = item.rawId || item.id;
          const resp = await apiClient.rejectApproval(idToUse, result.value);
          if (resp && resp.success) {
            Swal.fire({
              icon: 'info',
              title: 'Request Declined',
              text: `Notification sent to ${item.emp} with rejection remarks.`,
              timer: 2000,
              showConfirmButton: false
            });
            fetchApprovals();
          } else {
            showErrorToast(resp?.message || 'Failed to decline request.');
          }
        } catch (err) {
          console.error(err);
          showErrorToast('Error connecting to approvals API.');
        }
      }
    });
  };

  const handleApproveAll = async () => {
    const res = await showConfirmDialog({
      title: 'Approve All Pending?',
      text: `Grant approval for all ${pendingCount} pending requests in queue.`
    });

    if (res.isConfirmed) {
      try {
        const resp = await apiClient.bulkApproveAll();
        if (resp && resp.success) {
          showSuccessToast('All pending requests approved and synced with Mobile App!');
          fetchApprovals();
        } else {
          showErrorToast(resp?.message || 'Failed to bulk approve.');
        }
      } catch (err) {
        console.error(err);
        showErrorToast('Error connecting to bulk approve API.');
      }
    }
  };

  const handleSavePolicies = async () => {
    setSavingPolicy(true);
    try {
      const resp = await apiClient.updateLeavePolicies(leavePolicies);
      if (resp && resp.success) {
        showSuccessToast('Leave policies saved! App balance quotas synced.');
      } else {
        showErrorToast(resp?.message || 'Failed to save policies.');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Error saving policies to backend.');
    } finally {
      setSavingPolicy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Approvals & Policy Engine</h1>
          <p className="text-xs text-slate-500 font-medium">Review employee leave applications from Mobile App & configure company quota policies.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchApprovals()}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh Approvals"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          {pendingCount > 0 && (
            <button
              onClick={handleApproveAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <MdDoneAll className="text-base" />
              <span>Bulk Approve All ({pendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">All Employee Requests</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdAssignmentTurnedIn className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">Action Required</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <MdHourglassTop className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">Dossier Synced</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdTaskAlt className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</div>
            <div className="text-2xl font-black text-rose-500 mt-1">{rejectedCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">Declined with Remarks</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
            <MdCancel className="text-xl" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Inbox vs Policy Engine vs Upcoming Radar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'inbox'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdAssignmentTurnedIn className="text-base" />
          <span>Leave Request Inbox</span>
          {pendingCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'inbox' ? 'bg-white text-blue-600' : 'bg-amber-100 text-amber-700'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('teamRadar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'teamRadar'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdCalendarMonth className="text-base" />
          <span>Out of Office Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'policy'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdTune className="text-base" />
          <span>Leave Policy Engine</span>
        </button>
      </div>

      {/* TAB 1: INBOX */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search by Employee name, ticket ID, or leave type..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <MdFilterList /> Status:
              </span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3.5 whitespace-nowrap">Ticket ID</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Employee</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Leave Type</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Dates Requested</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Reason / Justification</th>
                    <th className="px-5 py-3.5 whitespace-nowrap text-center">Status</th>
                    <th className="px-5 py-3.5 sticky right-0 bg-slate-50/95 shadow-[-8px_0_12px_rgba(0,0,0,0.05)] text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <MdRefresh className="animate-spin text-xl text-blue-600" />
                          <span>Loading approvals from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No leave approval requests match current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] shrink-0">
                              {item.avatar || (item.emp ? item.emp.slice(0, 2).toUpperCase() : 'EM')}
                            </span>
                            <div className="leading-tight">
                              <div className="font-bold text-slate-900">{item.emp}</div>
                              <div className="text-[10px] text-slate-400 font-mono font-normal">{item.role || item.empId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800 whitespace-nowrap">
                          {item.type}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">
                          {item.dates}
                        </td>
                        <td className="px-5 py-3 text-slate-600 max-w-xs truncate whitespace-nowrap" title={item.reason}>
                          {item.reason}
                        </td>
                        <td className="px-5 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)] whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => handleApprove(item)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px] whitespace-nowrap"
                                >
                                  <MdCheck /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(item)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px] whitespace-nowrap"
                                >
                                  <MdClose /> Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setSelectedRequest(item)}
                                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-lg transition flex items-center gap-1 text-[11px] whitespace-nowrap"
                              >
                                <MdVisibility /> View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
              <div>
                Showing {filtered.length === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
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

      {/* TAB 2: UPCOMING OUT OF OFFICE RADAR */}
      {activeTab === 'teamRadar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Team Out of Office Calendar</h3>
              <p className="text-xs text-slate-500">Upcoming planned leaves across engineering, design, and operations from live database records.</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {approvals.filter(a => a.status === 'Approved').length} Approved Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {approvals.filter(a => a.status === 'Approved').slice(0, 6).map((card, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{card.emp}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-blue-600 bg-blue-50">{card.type}</span>
                </div>
                <p className="text-[11px] text-slate-500">{card.role || 'Employee'}</p>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pt-1">
                  <MdCalendarMonth className="text-slate-400" /> {card.dates}
                </div>
              </div>
            ))}
            {approvals.filter(a => a.status === 'Approved').length === 0 && (
              <div className="col-span-3 text-center py-8 text-xs text-slate-400">
                No approved leaves scheduled on the calendar radar yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE POLICIES ENGINE */}
      {activeTab === 'policy' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Organizational Leave Quota & Policy Engine</h3>
            <p className="text-xs text-slate-500">Set standard annual quotas synced live to the AayupOnes Mobile App balance cards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <MdBeachAccess className="text-lg" /> Casual Leave (CL) Quota
              </div>
              <label className="block text-slate-600 font-medium">Annual Quota (Days/Year)</label>
              <input
                type="number"
                value={leavePolicies.annualCL}
                onChange={(e) => setLeavePolicies({ ...leavePolicies, annualCL: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-[10px] text-slate-400 block">Accrued monthly for full-time employees.</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <MdMedicalServices className="text-lg" /> Sick Leave (SL) Quota
              </div>
              <label className="block text-slate-600 font-medium">Annual Quota (Days/Year)</label>
              <input
                type="number"
                value={leavePolicies.annualSL}
                onChange={(e) => setLeavePolicies({ ...leavePolicies, annualSL: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-[10px] text-slate-400 block">Medical prescription required beyond 2 consecutive days.</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <MdHomeWork className="text-lg" /> Work From Home (WFH)
              </div>
              <label className="block text-slate-600 font-medium">Monthly Allowed (Days/Month)</label>
              <input
                type="number"
                value={leavePolicies.monthlyWFHQuota}
                onChange={(e) => setLeavePolicies({ ...leavePolicies, monthlyWFHQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-[10px] text-slate-400 block">Department Head approval required for excess days.</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleSavePolicies}
              disabled={savingPolicy}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <MdTune /> {savingPolicy ? 'Saving to Database...' : 'Save & Broadcast Policies to Mobile App'}
            </button>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600">{selectedRequest.id}</span>
                <span className="text-sm font-extrabold text-slate-900">Leave Details</span>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Employee:</span>
                <span className="font-bold text-slate-900">{selectedRequest.emp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Leave Type:</span>
                <span className="font-bold text-slate-900">{selectedRequest.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Dates:</span>
                <span className="font-bold text-slate-900">{selectedRequest.dates}</span>
              </div>
              {selectedRequest.handoverTo && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Handover To:</span>
                  <span className="font-bold text-slate-800">{selectedRequest.handoverTo}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-2">
                <span className="text-slate-400 block font-semibold mb-1">Reason:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl">{selectedRequest.reason}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
