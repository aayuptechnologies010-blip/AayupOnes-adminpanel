import React, { useState } from 'react';
import { 
  MdReceiptLong, 
  MdDownload, 
  MdSend, 
  MdSearch,
  MdPayments,
  MdCheckCircle,
  MdAttachMoney,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdVisibility,
  MdPrint,
  MdFileDownload,
  MdLock,
  MdVerified,
  MdCorporateFare,
  MdEmail,
  MdPhone
} from 'react-icons/md';
import { initialEmployees } from '../data/mockData';
import { showSuccessToast } from '../utils/alerts';
import Swal from 'sweetalert2';

const Payslips = () => {
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const pageSize = 5;

  const filtered = initialEmployees.filter((emp) => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.dept.toLowerCase().includes(search.toLowerCase()) ||
    emp.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadPayslipPDF = (emp) => {
    Swal.fire({
      icon: 'success',
      title: 'Generating Official Payslip PDF',
      html: `Creating encrypted digital voucher for <b>${emp.name}</b> (${emp.id})...<br/>Pay Period: <b>${selectedMonth}</b>`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleBroadcastToApp = (emp) => {
    Swal.fire({
      icon: 'success',
      title: 'Dispatched to Mobile App!',
      html: `Payslip for <b>${selectedMonth}</b> pushed to <b>${emp.name}</b>'s mobile account. Push notification sent.`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleBulkBroadcast = () => {
    Swal.fire({
      title: `Publish & Broadcast All ${filtered.length} Payslips?`,
      text: `This will push password-protected ${selectedMonth} payslips directly to all employee mobile apps and emails.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Publish to Mobile App & Email'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Batch Distributed!',
          text: `All 42 active employee vouchers for ${selectedMonth} are now live on the mobile apps.`,
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Salary Payslips & Tax Vouchers</h1>
          <p className="text-xs text-slate-500 font-medium">Publish, generate and distribute employee monthly pay vouchers synced with Mobile App.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBulkBroadcast}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start shrink-0"
          >
            <MdSend className="text-base" />
            <span>Publish All to Mobile App & Email</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff Billed</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">42 Vouchers</div>
            <div className="text-[11px] text-slate-500 font-medium">Cycle: {selectedMonth}</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdReceiptLong className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Disbursal Pool</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">₹ 31,90,600</div>
            <div className="text-[11px] text-slate-500 font-medium">Direct Bank Transfer</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdAttachMoney className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile App Delivery Status</div>
            <div className="text-2xl font-black text-blue-600 mt-0.5">Published & Synced</div>
            <div className="text-[11px] text-slate-500 font-medium">Password Protected PDF</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdCheckCircle className="text-xl" />
          </div>
        </div>
      </div>

      {/* Filter and Period Selector */}
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
            placeholder="Search employee by name, ID or role..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">Pay Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="October 2026">October 2026 (Active)</option>
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>
        </div>
      </div>

      {/* Table of Employee Vouchers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Employee ID</th>
                <th className="px-6 py-3.5">Staff Member</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Monthly Basic</th>
                <th className="px-6 py-3.5">Allowances</th>
                <th className="px-6 py-3.5">Deductions (PF+Tax)</th>
                <th className="px-6 py-3.5">Net Disbursed</th>
                <th className="px-6 py-3.5">Mobile Status</th>
                <th className="px-6 py-3.5 sticky right-0 bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{emp.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                      {emp.avatar}
                    </span>
                    <div>
                      <div>{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{emp.role}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{emp.dept}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">₹ 35,417</td>
                  <td className="px-6 py-4 font-mono text-slate-600">₹ 35,417</td>
                  <td className="px-6 py-4 font-mono text-rose-600 font-bold">- ₹ 8,334</td>
                  <td className="px-6 py-4 font-mono font-black text-emerald-600">₹ 62,500</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                      <MdCheckCircle className="text-xs" /> Pushed to App
                    </span>
                  </td>
                  <td className="px-6 py-4 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedPayslip(emp)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                        title="View Formal Voucher"
                      >
                        <MdVisibility /> View
                      </button>
                      <button
                        onClick={() => handleDownloadPayslipPDF(emp)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                        title="Download PDF"
                      >
                        <MdDownload /> PDF
                      </button>
                      <button
                        onClick={() => handleBroadcastToApp(emp)}
                        className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="Re-send App Push"
                      >
                        <MdSend className="text-base" />
                      </button>
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

      {/* Formal Payslip Modal Preview */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 lg:p-8 animate-scaleIn">
            
            {/* Header of Voucher */}
            <div className="border-b border-slate-200 pb-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                  A1
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">AayupOnes Technologies Pvt. Ltd.</h3>
                  <p className="text-[11px] text-slate-500">Official Payslip Voucher &bull; {selectedMonth}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {selectedPayslip.id}
                </span>
              </div>
            </div>

            {/* Employee Meta Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs mb-5">
              <div>
                <span className="text-slate-400 block font-semibold">Employee Name:</span>
                <span className="font-extrabold text-slate-800">{selectedPayslip.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Designation:</span>
                <span className="font-bold text-slate-800">{selectedPayslip.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Department:</span>
                <span className="font-bold text-slate-800">{selectedPayslip.dept}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Bank Account:</span>
                <span className="font-mono font-bold text-slate-800">HDFC &bull;&bull; 7291</span>
              </div>
            </div>

            {/* Dual Column Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5">
              {/* Earnings */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-1.5">
                  Earnings (₹)
                </h4>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-700">Basic Salary</span>
                  <span className="font-mono font-bold text-slate-900">₹ 35,417.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-700">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-bold text-slate-900">₹ 14,167.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-700">Special & Performance Allowance</span>
                  <span className="font-mono font-bold text-slate-900">₹ 21,250.00</span>
                </div>
                <div className="flex justify-between pt-1 font-black text-emerald-950">
                  <span>Gross Earnings:</span>
                  <span className="font-mono text-sm">₹ 70,834.00</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2">
                <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider border-b border-rose-200 pb-1.5">
                  Deductions (₹)
                </h4>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-700">Provident Fund (EPF 12%)</span>
                  <span className="font-mono font-bold text-rose-600">₹ 4,250.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-700">Professional Tax (PT)</span>
                  <span className="font-mono font-bold text-rose-600">₹ 200.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-700">Income Tax TDS (Sec 192)</span>
                  <span className="font-mono font-bold text-rose-600">₹ 3,884.00</span>
                </div>
                <div className="flex justify-between pt-1 font-black text-rose-950">
                  <span>Total Deductions:</span>
                  <span className="font-mono text-sm">₹ 8,334.00</span>
                </div>
              </div>
            </div>

            {/* Net In-Hand Highlight */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between mb-5">
              <div>
                <span className="text-xs font-bold text-blue-900 block">Net Disbursed Take-Home Salary</span>
                <span className="text-[11px] text-blue-600">Disbursed directly via NEFT on 31 Oct 2026</span>
              </div>
              <div className="text-2xl font-black text-blue-700 font-mono">
                ₹ 62,500.00
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <MdLock className="text-slate-400" />
                <span>Password for Employee: PAN + Birth Year</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadPayslipPDF(selectedPayslip);
                    setSelectedPayslip(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <MdDownload className="text-base" /> Download Official PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payslips;
