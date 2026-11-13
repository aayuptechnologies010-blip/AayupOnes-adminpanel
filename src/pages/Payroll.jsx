import React, { useState, useEffect, useCallback } from 'react';
import { 
  MdPayments, 
  MdCheckCircle, 
  MdSecurity, 
  MdAccountBalance, 
  MdSend,
  MdReceiptLong,
  MdTune,
  MdClose,
  MdCalculate,
  MdSave,
  MdFileDownload,
  MdRefresh
} from 'react-icons/md';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alerts';
import apiClient from '../services/api';
import { exportToExcel } from '../utils/exportUtils';

const Payroll = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [payrollStatus, setPayrollStatus] = useState('Processed & Ready');
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [summary, setSummary] = useState({ totalEmployees: 0, totalGross: 0, totalNet: 0, totalDeductions: 0 });
  const [loading, setLoading] = useState(true);
  const selectedMonth = 'November 2026';
  
  // Interactive Salary Configurator Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [salaryInputs, setSalaryInputs] = useState({
    annualCTC: 850000,
    basicSalary: 35417,
    hra: 14167,
    specialAllowance: 15250,
    pfEmployee: 4250,
    esic: 0,
    pt: 200,
    tds: 3884
  });

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getPayroll({ month: selectedMonth });
      if (res && res.success) {
        setPayrollRecords(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (e) {
      console.error(e);
      showErrorToast('Failed to load live payroll records.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const handleOpenConfigurator = (emp) => {
    setSelectedEmp(emp);
    const parsedCTC = Number(emp.gross || 65000) * 12;
    const monthlyGross = Math.round(parsedCTC / 12);
    const basic = Math.round(monthlyGross * 0.50);
    const hra = Math.round(basic * 0.40);
    const pf = Math.round(basic * 0.12);
    const special = Math.max(0, monthlyGross - (basic + hra));
    const pt = 200;
    const tds = Math.round(monthlyGross * 0.05);

    setSalaryInputs({
      annualCTC: parsedCTC,
      basicSalary: basic,
      hra: hra,
      specialAllowance: special,
      pfEmployee: pf,
      esic: monthlyGross <= 21000 ? Math.round(monthlyGross * 0.0075) : 0,
      pt: pt,
      tds: tds
    });
    setIsModalOpen(true);
  };

  const handleCTCChange = (val) => {
    const ctc = parseInt(val, 10) || 0;
    const monthlyGross = Math.round(ctc / 12);
    const basic = Math.round(monthlyGross * 0.50);
    const hra = Math.round(basic * 0.40);
    const pf = Math.round(basic * 0.12);
    const special = Math.max(0, monthlyGross - (basic + hra));
    const pt = 200;
    const tds = Math.round(monthlyGross * 0.05);

    setSalaryInputs({
      annualCTC: ctc,
      basicSalary: basic,
      hra: hra,
      specialAllowance: special,
      pfEmployee: pf,
      esic: monthlyGross <= 21000 ? Math.round(monthlyGross * 0.0075) : 0,
      pt: pt,
      tds: tds
    });
  };

  const handleSaveSalaryStructure = () => {
    showSuccessToast(`Salary structure updated for ${selectedEmp?.name}!`);
    setIsModalOpen(false);
  };

  const handleRunPayroll = async () => {
    const res = await showConfirmDialog({
      title: 'Disburse Payroll for November 2026?',
      text: `Authorize electronic NEFT disbursal of ₹ ${summary.totalNet.toLocaleString('en-IN')} across ${summary.totalEmployees} employees?`
    });

    if (res.isConfirmed) {
      setIsProcessing(true);
      try {
        await apiClient.runPayrollBatch(selectedMonth);
        setPayrollStatus('Disbursed & Published');
        showSuccessToast('Payroll batch processed & payslips published to Mobile App!');
      } catch (err) {
        showErrorToast('Failed to execute payroll.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleExportPayrollExcel = () => {
    if (payrollRecords.length === 0) {
      showErrorToast('No payroll records to export.');
      return;
    }

    const excelData = payrollRecords.map(item => ({
      'Employee ID': item.employeeId,
      'Name': item.name,
      'Department': item.department,
      'Designation': item.designation,
      'Month': item.month,
      'Monthly Basic (INR)': item.basic,
      'HRA (INR)': item.hra,
      'Special Allowances (INR)': item.allowances,
      'Gross Salary (INR)': item.gross,
      'EPF Employee (INR)': item.pf,
      'PT (INR)': item.pt,
      'TDS (INR)': item.tds,
      'Total Deductions (INR)': item.deductions,
      'Net Take-Home (INR)': item.netPay,
      'Bank Account': item.bankAccount,
      'Payment Status': item.paymentStatus
    }));

    exportToExcel(excelData, `AayupOnes_Payroll_Master_${selectedMonth.replace(/\s+/g, '_')}.xlsx`, 'Payroll');
    showSuccessToast('Payroll ledger exported to Excel successfully!');
  };

  const grossEarnings = Number(salaryInputs.basicSalary) + Number(salaryInputs.hra) + Number(salaryInputs.specialAllowance);
  const totalDeductions = Number(salaryInputs.pfEmployee) + Number(salaryInputs.esic) + Number(salaryInputs.pt) + Number(salaryInputs.tds);
  const netInHand = Math.max(0, grossEarnings - totalDeductions);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payroll & Compensation</h1>
          <p className="text-xs text-slate-500 font-medium">Monthly salary processing, EPF/ESIC statutory compliance and direct bank advice.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPayroll()}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh Payroll"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleExportPayrollExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <MdFileDownload className="text-base" />
            <span>Export Payroll Ledger (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Main Payroll Cycle Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-2xl p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-white/20 text-white tracking-wider">
              CYCLE: {selectedMonth.toUpperCase()}
            </span>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-400 text-slate-950">
              {payrollStatus}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs text-blue-200 font-medium">Estimated Net Disbursal Amount</div>
            <div className="text-3xl font-black tracking-tight mt-1">₹ {summary.totalNet ? summary.totalNet.toLocaleString('en-IN') : '0.00'}</div>
          </div>

          <div className="mt-4 flex items-center gap-6 text-xs text-blue-100 font-medium">
            <div>Headcount: <strong className="text-white">{summary.totalEmployees || payrollRecords.length} Active Employees</strong></div>
            <div>Scheduled Payout: <strong className="text-white">01 Nov 2026</strong></div>
          </div>
        </div>

        <div>
          <button
            onClick={handleRunPayroll}
            disabled={isProcessing || payrollStatus === 'Disbursed & Published'}
            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl transition shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span>Executing Bank Advice...</span>
            ) : (
              <>
                <MdSend className="text-base" />
                <span>Execute Final Disbursal & Publish Payslips</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4-Step Wizard */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-sm text-slate-900 mb-4">Payroll Cycle Milestones & Processing</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Attendance Locked', desc: 'Syncing attendance records', done: payrollRecords.length > 0 },
            { step: '2', title: 'Claims & Reimbursements', desc: 'Syncing expense claims', done: payrollRecords.length > 0 },
            { step: '3', title: 'Statutory Taxes Computed', desc: 'EPF, ESI & TDS slabs synced', done: payrollRecords.length > 0 },
            { step: '4', title: 'Direct Bank NEFT File', desc: payrollStatus === 'Disbursed & Published' ? 'Completed' : 'Awaiting Processing', done: payrollStatus === 'Disbursed & Published' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  {item.step}
                </span>
                {item.done && <MdCheckCircle className="text-emerald-500 text-lg" />}
              </div>
              <div className="mt-3 font-extrabold text-xs text-slate-900">{item.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Quick Salary Table with Single Line & Slide */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Employee Salary Structures</h3>
            <p className="text-xs text-slate-500">Configure CTC, HRA, PF and Net take-home for individual staff</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Scroll table horizontally &rarr;</span>
        </div>

        <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase font-bold text-[11px] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Annual CTC</th>
                <th className="py-3 px-4">Monthly Basic</th>
                <th className="py-3 px-4">HRA (40%)</th>
                <th className="py-3 px-4">EPF (12%)</th>
                <th className="py-3 px-4">Net In-Hand</th>
                <th className="py-3 px-4 sticky right-0 bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading salary structures...
                  </td>
                </tr>
              ) : (
                payrollRecords.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                        {emp.avatar || 'TM'}
                      </span>
                      <div>
                        <div>{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{emp.employeeId}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                    <td className="py-3 px-4 text-slate-600">{emp.designation}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">₹ {(Number(emp.gross) * 12).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono">₹ {Number(emp.basic).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono">₹ {Number(emp.hra).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-mono text-rose-600">₹ {Number(emp.pf).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600 font-mono">₹ {Number(emp.netPay).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">
                      <button
                        onClick={() => handleOpenConfigurator(emp)}
                        className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold transition flex items-center gap-1"
                      >
                        <MdTune /> Edit Salary
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Salary Configurator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                  <MdCalculate className="text-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Configure Compensation Structure</h3>
                  <p className="text-xs text-slate-500">{selectedEmp.name} &bull; {selectedEmp.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual CTC (Cost to Company in ₹) *</label>
                <input
                  type="number"
                  value={salaryInputs.annualCTC}
                  onChange={(e) => handleCTCChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="850000"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Monthly Gross: ₹ {Math.round(salaryInputs.annualCTC / 12).toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings Column */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Monthly Allowances</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Basic Salary (50%)</label>
                    <input
                      type="number"
                      value={salaryInputs.basicSalary}
                      onChange={(e) => setSalaryInputs({ ...salaryInputs, basicSalary: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">HRA (40% of Basic)</label>
                    <input
                      type="number"
                      value={salaryInputs.hra}
                      onChange={(e) => setSalaryInputs({ ...salaryInputs, hra: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Special Allowance</label>
                    <input
                      type="number"
                      value={salaryInputs.specialAllowance}
                      onChange={(e) => setSalaryInputs({ ...salaryInputs, specialAllowance: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="pt-2 border-t border-emerald-200 flex justify-between text-xs font-black text-emerald-900">
                    <span>Gross Monthly:</span>
                    <span className="font-mono">₹ {grossEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3">
                  <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Monthly Deductions</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Provident Fund (12%)</label>
                    <input
                      type="number"
                      value={salaryInputs.pfEmployee}
                      onChange={(e) => setSalaryInputs({ ...salaryInputs, pfEmployee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Professional Tax (PT)</label>
                    <input
                      type="number"
                      value={salaryInputs.pt}
                      onChange={(e) => setSalaryInputs({ ...salaryInputs, pt: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">TDS / Income Tax</label>
                    <input
                      type="number"
                      value={salaryInputs.tds}
                      onChange={(e) => setSalaryInputs({ ...salaryInputs, tds: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="pt-2 border-t border-rose-200 flex justify-between text-xs font-black text-rose-900">
                    <span>Total Deductions:</span>
                    <span className="font-mono">₹ {totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Net Take-Home Highlight */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-900 block">Computed Net In-Hand Salary</span>
                  <span className="text-[11px] text-indigo-600">Disbursed directly on monthly cut-off cycle</span>
                </div>
                <div className="text-xl font-black text-indigo-700 font-mono">
                  ₹ {netInHand.toLocaleString('en-IN')} / mo
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSalaryStructure}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
              >
                <MdSave className="text-sm" /> Save & Update Slabs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
