import React, { useState, useEffect, useCallback } from 'react';
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
  MdPhone,
  MdRefresh
} from 'react-icons/md';
import { showSuccessToast, showErrorToast } from '../utils/alerts';
import Swal from 'sweetalert2';
import apiClient from '../services/api';
import { generatePayslipPDF, exportToExcel } from '../utils/exportUtils';

const Payslips = () => {
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [summary, setSummary] = useState({ totalStaff: 0, grossPool: 0, netPool: 0 });
  const [loading, setLoading] = useState(true);
  const pageSize = 8;

  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getPayslips({ month: selectedMonth, search });
      if (res && res.success) {
        setPayslips(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        } else {
          const list = res.data || [];
          setSummary({
            totalStaff: list.length,
            grossPool: list.reduce((sum, item) => sum + (item.grossSalary || 0), 0),
            netPool: list.reduce((sum, item) => sum + (item.netSalary || 0), 0)
          });
        }
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load payslips from server.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, search]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  const filtered = payslips.filter((emp) => 
    (emp.empName || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.employeeId || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadPayslipPDF = (emp) => {
    const success = generatePayslipPDF(emp);
    if (success) {
      showSuccessToast(`Payslip PDF downloaded for ${emp.empName || 'Employee'}`);
    } else {
      showErrorToast('Failed to generate payslip PDF.');
    }
  };

  const handleExportPayslipsExcel = () => {
    if (filtered.length === 0) {
      showErrorToast('No payslips available to export.');
      return;
    }

    const excelData = filtered.map(item => ({
      'Voucher No': item.slipNo,
      'Employee ID': item.employeeId,
      'Employee Name': item.empName,
      'Department': item.department,
      'Designation': item.designation,
      'Pay Month': item.month,
      'Basic Salary (INR)': item.basic,
      'HRA (INR)': item.hra,
      'Gross Salary (INR)': item.grossSalary,
      'Provident Fund (INR)': item.providentFund,
      'Income Tax TDS (INR)': item.tds,
      'Total Deductions (INR)': item.totalDeductions,
      'Net Salary Disbursed (INR)': item.netSalary,
      'Paid Days': item.paidDays,
      'Bank Account': item.bankAccount,
      'Status': item.status
    }));

    exportToExcel(excelData, `Payslips_Ledger_${selectedMonth.replace(/\s+/g, '_')}.xlsx`, 'Payslips');
    showSuccessToast('Payslips ledger exported to Excel successfully!');
  };

  const handleBroadcastToApp = async (emp, options = { toApp: true, toEmail: true }) => {
    try {
      const res = await apiClient.sendPayslip({
        id: emp.id,
        sendToApp: options.toApp,
        sendToEmail: options.toEmail
      });
      if (res && res.success) {
        showSuccessToast(res.message || 'Payslip dispatched successfully!');
        fetchPayslips();
      } else {
        showErrorToast(res?.message || 'Failed to dispatch payslip');
      }
    } catch (err) {
      showErrorToast('Error dispatching payslip: ' + err.message);
    }
  };

  const handleOpenSendModal = (emp) => {
    Swal.fire({
      title: `Send Payslip to ${emp.empName}`,
      html: `
        <div style="text-align: left; font-size: 13px; color: #475569;">
          <p style="margin-bottom: 12px;">Choose delivery channels for <b>${emp.month}</b> payslip:</p>
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;">
            <input type="checkbox" id="swalSendApp" checked style="width: 16px; height: 16px; accent-color: #2563eb;" />
            <span><strong>Send to Mobile App</strong> (Push Notification + In-App View)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="swalSendEmail" checked style="width: 16px; height: 16px; accent-color: #2563eb;" />
            <span><strong>Send to Email</strong> (${emp.email || 'Registered Employee Email'})</span>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Send Payslip Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      preConfirm: () => {
        const toApp = document.getElementById('swalSendApp').checked;
        const toEmail = document.getElementById('swalSendEmail').checked;
        if (!toApp && !toEmail) {
          Swal.showValidationMessage('Please select at least one delivery channel.');
          return false;
        }
        return { toApp, toEmail };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleBroadcastToApp(emp, result.value);
      }
    });
  };

  const handleBulkBroadcast = () => {
    Swal.fire({
      title: `Dispatch All ${filtered.length} Payslips?`,
      html: `
        <div style="text-align: left; font-size: 13px; color: #475569;">
          <p style="margin-bottom: 12px;">This will publish and send <b>${selectedMonth}</b> payslips to all employees:</p>
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;">
            <input type="checkbox" id="swalBulkApp" checked style="width: 16px; height: 16px; accent-color: #2563eb;" />
            <span><strong>Publish to Mobile App</strong> (Push alerts to all devices)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="swalBulkEmail" checked style="width: 16px; height: 16px; accent-color: #2563eb;" />
            <span><strong>Send via Official Email</strong> (HTML salary advice to all inboxes)</span>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Dispatch to All Staff',
      preConfirm: () => {
        const toApp = document.getElementById('swalBulkApp').checked;
        const toEmail = document.getElementById('swalBulkEmail').checked;
        if (!toApp && !toEmail) {
          Swal.showValidationMessage('Please select at least one channel.');
          return false;
        }
        return { toApp, toEmail };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiClient.sendBulkPayslips({
            month: selectedMonth,
            sendToApp: result.value.toApp,
            sendToEmail: result.value.toEmail
          });
          if (res && res.success) {
            Swal.fire({
              icon: 'success',
              title: 'Batch Distributed!',
              text: res.message || 'All payslips dispatched successfully.',
              timer: 2200,
              showConfirmButton: false
            });
            fetchPayslips();
          } else {
            showErrorToast(res?.message || 'Failed to dispatch bulk payslips');
          }
        } catch (err) {
          showErrorToast('Bulk dispatch error: ' + err.message);
        }
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
            onClick={() => fetchPayslips()}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh Payslips"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleExportPayslipsExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <MdFileDownload className="text-base" />
            <span>Export Slips (.xlsx)</span>
          </button>
          <button
            onClick={handleBulkBroadcast}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start shrink-0"
          >
            <MdSend className="text-base" />
            <span>Publish All to Mobile App</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff Billed</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{summary.totalStaff} Vouchers</div>
            <div className="text-[11px] text-slate-500 font-medium">Cycle: {selectedMonth}</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdReceiptLong className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Disbursal Pool</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">₹ {summary.grossPool.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-500 font-medium">Direct Bank Transfer</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdAttachMoney className="text-xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile App Delivery Status</div>
            <div className="text-2xl font-black text-blue-600 mt-0.5">
              {summary.totalStaff > 0 ? 'Published & Synced' : 'Awaiting Generation'}
            </div>
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
            <option value="November 2026">November 2026 (Active)</option>
            <option value="October 2026">October 2026</option>
            <option value="September 2026">September 2026</option>
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
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    Loading salary vouchers from database...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No payslips found for this period.
                  </td>
                </tr>
              ) : (
                paginatedData.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{emp.employeeId}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                        {emp.avatar || 'EM'}
                      </span>
                      <div>
                        <div>{emp.empName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{emp.designation}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{emp.department}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">₹ {Number(emp.basic).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">₹ {(Number(emp.hra) + Number(emp.specialAllowance || 0)).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 font-mono text-rose-600 font-bold">- ₹ {Number(emp.totalDeductions).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 font-mono font-black text-emerald-600">₹ {Number(emp.netSalary).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${emp.sentToApp ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          <MdCheckCircle className="text-xs" /> {emp.sentToApp ? 'App: Delivered' : 'App: Pending'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${emp.sentViaEmail ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          <MdEmail className="text-xs" /> {emp.sentViaEmail ? 'Email: Sent' : 'Email: Not sent'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenSendModal(emp)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                          title="Send to Mobile App and/or Email"
                        >
                          <MdSend /> Send
                        </button>
                        <button
                          onClick={() => setSelectedPayslip(emp)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                          title="View Formal Voucher"
                        >
                          <MdVisibility /> View
                        </button>
                        <button
                          onClick={() => handleDownloadPayslipPDF(emp)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                          title="Download Formatted PDF"
                        >
                          <MdDownload /> PDF
                        </button>
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
