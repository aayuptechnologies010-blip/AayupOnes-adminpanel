import React, { useState, useEffect, useCallback } from 'react';
import { 
  MdReceipt, 
  MdCheck, 
  MdClose, 
  MdCurrencyRupee, 
  MdSearch, 
  MdFilterList,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdAccountBalanceWallet,
  MdPendingActions,
  MdCheckCircleOutline,
  MdVisibility,
  MdCloudUpload,
  MdDownload,
  MdDescription,
  MdPayment,
  MdAttachMoney,
  MdFileDownload,
  MdRefresh
} from 'react-icons/md';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alerts';
import Swal from 'sweetalert2';
import apiClient from '../services/api';
import { exportToExcel } from '../utils/exportUtils';

const Reimbursements = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'policy'
  const [claims, setClaims] = useState([]);
  const [metrics, setMetrics] = useState({ totalClaims: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0, pendingAmount: 0, approvedAmount: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const pageSize = 8;

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getReimbursements({ search, status: statusFilter });
      if (res && res.success) {
        setClaims(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load reimbursement claims from server.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const filtered = claims.filter((claim) => {
    const s = search.toLowerCase();
    const matchesSearch = 
      (claim.employeeName || '').toLowerCase().includes(s) ||
      (claim.category || '').toLowerCase().includes(s) ||
      (claim.claimId || '').toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'All' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApprove = async (claim) => {
    const res = await showConfirmDialog({
      title: 'Approve Reimbursement Claim?',
      text: `Grant approval for ₹ ${Number(claim.amount).toLocaleString('en-IN')} submitted by ${claim.employeeName} for ${claim.category}?`
    });

    if (res.isConfirmed) {
      try {
        const resp = await apiClient.approveReimbursement(claim.id);
        if (resp && resp.success) {
          showSuccessToast(`Claim ${claim.claimId} approved! Added to payroll queue.`);
          fetchClaims();
        } else {
          showErrorToast(resp?.message || 'Failed to approve claim.');
        }
      } catch (err) {
        showErrorToast('Error approving claim.');
      }
    }
  };

  const handleReject = (claim) => {
    Swal.fire({
      title: 'Reject Claim',
      input: 'textarea',
      inputLabel: 'Reason for Rejection',
      inputPlaceholder: 'e.g. Bill receipt is missing VAT/GST number or unclear scan.',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Decline Claim',
      inputValidator: (value) => {
        if (!value) return 'Please mention a reason for the employee!';
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const resp = await apiClient.rejectReimbursement(claim.id, result.value);
          if (resp && resp.success) {
            Swal.fire({
              icon: 'info',
              title: 'Claim Rejected',
              text: `Notification sent to ${claim.employeeName} with remarks.`,
              timer: 2000,
              showConfirmButton: false
            });
            fetchClaims();
          } else {
            showErrorToast(resp?.message || 'Failed to reject claim.');
          }
        } catch (err) {
          showErrorToast('Error rejecting claim.');
        }
      }
    });
  };

  const handleExportClaimsExcel = () => {
    if (filtered.length === 0) {
      showErrorToast('No claims available to export.');
      return;
    }

    const excelData = filtered.map(item => ({
      'Claim ID': item.claimId,
      'Employee ID': item.employeeId,
      'Employee Name': item.employeeName,
      'Department': item.department,
      'Expense Category': item.category,
      'Claim Title': item.title,
      'Bill Amount (INR)': item.amount,
      'Incident Date': item.date,
      'Claim Status': item.status,
      'Remarks': item.remarks
    }));

    exportToExcel(excelData, `Expense_Claims_Audit_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Reimbursements');
    showSuccessToast('Expense claims exported to Excel successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense Claims & Reimbursements</h1>
          <p className="text-xs text-slate-500 font-medium">Audit bills submitted from Mobile App & auto-queue approved amounts to Payroll.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchClaims()}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh Claims"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleExportClaimsExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <MdFileDownload className="text-base" />
            <span>Export Claims (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Claims Filed</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalClaims || claims.length} Claims</div>
            <div className="text-[11px] text-slate-500 font-medium">Via AayupOnes Mobile App</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdReceipt className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Audit</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{metrics.pendingCount || 0} Claims</div>
            <div className="text-[11px] text-slate-500 font-medium">Action Required by Finance</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <MdPendingActions className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved for Payroll</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹ {Number(metrics.approvedAmount || 0).toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-500 font-medium">Queued for Bank Disbursal</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdAccountBalanceWallet className="text-xl" />
          </div>
        </div>
      </div>

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
            placeholder="Search employee, ID or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <MdFilterList className="text-slate-700 text-base" /> Status:
          </span>
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
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

      {/* Claims Table with Single-line Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Claim ID</th>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Bill Date</th>
                <th className="px-6 py-3.5">Claimed Amount</th>
                <th className="px-6 py-3.5">Attached Bill</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 sticky right-0 bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Loading claims from database...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No expense claims match current filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{claim.claimId}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                        {claim.avatar || 'EM'}
                      </span>
                      <div>
                        <div>{claim.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{claim.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{claim.category}</td>
                    <td className="px-6 py-4 text-slate-600">{claim.date}</td>
                    <td className="px-6 py-4 font-mono font-extrabold text-emerald-600 text-sm">₹ {Number(claim.amount).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      {claim.receiptUrl ? (
                        <a
                          href={claim.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold inline-flex items-center gap-1 transition text-[11px]"
                        >
                          <MdDescription className="text-blue-600" /> View Bill
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Attached in Dossier</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          claim.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : claim.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-1.5">
                        {claim.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(claim)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                            >
                              <MdCheck /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(claim)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                            >
                              <MdClose /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Audited</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      {/* Bill Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Expense Receipt Voucher</h3>
                <p className="text-[11px] text-slate-500">{selectedReceipt.claimId || selectedReceipt.id} &bull; {selectedReceipt.employeeName || selectedReceipt.emp}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Claimed Amount</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">₹ {Number(selectedReceipt.amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Category</span>
                  <span className="text-xs font-bold text-slate-800">{selectedReceipt.category}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Business Purpose / Explanation</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedReceipt.remarks || selectedReceipt.reason || 'No description provided.'}
                </p>
              </div>

              {/* Bill Simulation Card */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50/50 text-center flex flex-col items-center justify-center">
                <MdReceipt className="text-4xl text-blue-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">{selectedReceipt.receiptUrl ? 'Bill Attached' : 'Attached via Mobile Camera'}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Verified GST Invoice</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
              {selectedReceipt.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(selectedReceipt);
                    setSelectedReceipt(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Approve Claim
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reimbursements;
