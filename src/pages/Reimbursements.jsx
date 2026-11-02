import React, { useState } from 'react';
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
  MdAttachMoney
} from 'react-icons/md';
import { showSuccessToast, showConfirmDialog } from '../utils/alerts';
import Swal from 'sweetalert2';

const Reimbursements = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'policy'
  const [claims, setClaims] = useState([
    {
      id: 'EXP-101',
      emp: 'Amit Patel',
      role: 'QA Automation Lead',
      avatar: 'AP',
      category: 'Travel & Cab Fare',
      amount: '₹ 1,850.00',
      billDate: '26 Oct 2026',
      reason: 'Cab fare for client server deployment at Hazratganj branch',
      billDoc: 'Uber_Receipt_26Oct.pdf',
      status: 'Pending',
      submittedVia: 'AayupOnes Mobile App'
    },
    {
      id: 'EXP-102',
      emp: 'Vikram Singh',
      role: 'Lead Backend Architect',
      avatar: 'VS',
      category: 'Client Dinner / Refreshment',
      amount: '₹ 3,420.00',
      billDate: '25 Oct 2026',
      reason: 'Sprint milestone dinner with onshore tech stakeholders',
      billDoc: 'Taj_Dining_Voucher.jpg',
      status: 'Approved',
      submittedVia: 'AayupOnes Mobile App'
    },
    {
      id: 'EXP-103',
      emp: 'Sneha Tiwari',
      role: 'Lead Product Designer',
      avatar: 'ST',
      category: 'Software License',
      amount: '₹ 2,100.00',
      billDate: '20 Oct 2026',
      reason: 'Figma plugin subscription for design asset export',
      billDoc: 'Figma_Invoice_Oct.pdf',
      status: 'Approved',
      submittedVia: 'AayupOnes Mobile App'
    },
    {
      id: 'EXP-104',
      emp: 'Rahul Kumar',
      role: 'Senior React Developer',
      avatar: 'RK',
      category: 'Internet Broadband Allowance',
      amount: '₹ 1,200.00',
      billDate: '15 Oct 2026',
      reason: 'Monthly remote WFH fiber connectivity bill reimbursement',
      billDoc: 'Airtel_Broadband_Oct.pdf',
      status: 'Approved',
      submittedVia: 'AayupOnes Mobile App'
    },
    {
      id: 'EXP-105',
      emp: 'Rohan Saxena',
      role: 'Growth & Marketing Lead',
      avatar: 'RS',
      category: 'Client Meet & Travel',
      amount: '₹ 2,750.00',
      billDate: '18 Oct 2026',
      reason: 'Express train tickets for client onboarding at Kanpur',
      billDoc: 'IRCTC_Train_Ticket.pdf',
      status: 'Pending',
      submittedVia: 'AayupOnes Mobile App'
    }
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const pageSize = 5;

  const filtered = claims.filter((claim) => {
    const matchesSearch = 
      claim.emp.toLowerCase().includes(search.toLowerCase()) ||
      claim.category.toLowerCase().includes(search.toLowerCase()) ||
      claim.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const pendingCount = claims.filter(c => c.status === 'Pending').length;
  const totalApprovedAmount = claims
    .filter(c => c.status === 'Approved')
    .reduce((sum, c) => sum + parseFloat(c.amount.replace(/[^0-9.]/g, '')), 0);

  const handleApproveClaim = (claim) => {
    Swal.fire({
      title: 'Approve Expense Claim?',
      html: `Approve <b>${claim.amount}</b> for <b>${claim.emp}</b>?<br/>This amount will be added to the upcoming monthly payroll run.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Approve & Queue for Payroll'
    }).then((result) => {
      if (result.isConfirmed) {
        setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'Approved' } : c));
        Swal.fire({
          icon: 'success',
          title: 'Claim Approved!',
          text: `${claim.amount} has been queued into October 2026 payroll. Notification sent to Mobile App.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleRejectClaim = (claim) => {
    Swal.fire({
      title: 'Decline Expense Claim',
      input: 'textarea',
      inputLabel: 'Reason for Rejection / Audit Discrepancy',
      inputPlaceholder: 'e.g. GST invoice copy is missing or exceeds monthly allowance limit.',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Reject Claim',
      inputValidator: (value) => {
        if (!value) return 'Please mention a reason for the employee!';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'Rejected' } : c));
        Swal.fire({
          icon: 'info',
          title: 'Claim Rejected',
          text: `Notification sent to ${claim.emp} with audit remarks.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense Claims & Reimbursements</h1>
          <p className="text-xs text-slate-500 font-medium">Audit bills submitted from Mobile App & auto-queue approved amounts to Payroll.</p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Claims Filed</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{claims.length} Claims</div>
            <div className="text-[11px] text-slate-500 font-medium">Via AayupOnes Mobile App</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdReceipt className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Audit</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{pendingCount} Claims</div>
            <div className="text-[11px] text-slate-500 font-medium">Action Required by Finance</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <MdPendingActions className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved for Payroll</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹ {totalApprovedAmount.toLocaleString('en-IN')}</div>
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
              {paginatedData.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{claim.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                      {claim.avatar}
                    </span>
                    <div>
                      <div>{claim.emp}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{claim.role}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{claim.category}</td>
                  <td className="px-6 py-4 text-slate-600">{claim.billDate}</td>
                  <td className="px-6 py-4 font-mono font-extrabold text-emerald-600 text-sm">{claim.amount}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedReceipt(claim)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold flex items-center gap-1 transition text-[11px]"
                    >
                      <MdDescription className="text-blue-600" /> View Bill
                    </button>
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
                            onClick={() => handleApproveClaim(claim)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                          >
                            <MdCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectClaim(claim)}
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

      {/* Bill Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Expense Receipt Voucher</h3>
                <p className="text-[11px] text-slate-500">{selectedReceipt.id} &bull; {selectedReceipt.emp}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Claimed Amount</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">{selectedReceipt.amount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Category</span>
                  <span className="text-xs font-bold text-slate-800">{selectedReceipt.category}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Business Purpose / Explanation</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedReceipt.reason}
                </p>
              </div>

              {/* Bill Simulation Card */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50/50 text-center flex flex-col items-center justify-center">
                <MdReceipt className="text-4xl text-blue-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">{selectedReceipt.billDoc}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Attached via Mobile Camera Upload &bull; Verified GST Invoice</span>
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
                    handleApproveClaim(selectedReceipt);
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
