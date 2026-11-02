import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdSearch, 
  MdPersonAdd, 
  MdFilterList, 
  MdEmail, 
  MdPhone, 
  MdBadge, 
  MdLocationPin,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdLockReset,
  MdVisibility,
  MdDeleteOutline,
  MdGroups,
  MdCheckCircle,
  MdBeachAccess,
  MdWorkHistory,
  MdContentCopy,
  MdShare,
  MdLink,
  MdLockOutline,
  MdVisibilityOff,
  MdHourglassTop,
  MdErrorOutline
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { initialEmployees } from '../data/mockData';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alerts';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOnboardingSuccessModalOpen, setIsOnboardingSuccessModalOpen] = useState(false);
  const [newlyCreatedEmp, setNewlyCreatedEmp] = useState(null);

  // Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetEmp, setResetTargetEmp] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Simplified Add Employee Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    dept: 'Engineering',
    email: '',
    initialPassword: 'Welcome@' + Math.floor(1000 + Math.random() * 9000),
    shift: 'General Shift (09:30 AM - 06:30 PM)',
    phone: '',
    salary: '₹ 7,50,000'
  });

  // Filter & Search logic
  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      emp.name.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q);
    const matchesDept = selectedDept === 'All' || emp.dept === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.onboardingStatus === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // KPI counters
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const underReviewCount = employees.filter(e => e.onboardingStatus === 'Under Review' || e.onboardingStatus === 'Submitted').length;
  const correctionCount = employees.filter(e => e.onboardingStatus === 'Correction Required').length;

  // 1. ADD EMPLOYEE WITH QUICK DETAILS & AUTO-GENERATED ID + ONBOARDING LINK
  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      showErrorToast('Please fill all mandatory initial fields');
      return;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `AAYUP-EMP-${new Date().getFullYear()}-${uniqueNum}`;
    const generatedToken = `onb_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newEmp = {
      id: generatedId,
      name: formData.name.trim(),
      role: formData.role.trim(),
      dept: formData.dept,
      type: 'Full Time',
      status: 'Active',
      onboardingStatus: 'Not Started',
      onboardingProgress: 10,
      avatar: formData.name.trim().substring(0, 2).toUpperCase(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '+91 98000 00000',
      joined: formattedDate,
      manager: 'Rahul Kumar (HR Admin)',
      salary: formData.salary,
      location: 'Lucknow Office',
      onboardingToken: generatedToken
    };

    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    setNewlyCreatedEmp(newEmp);
    setIsOnboardingSuccessModalOpen(true);

    // Reset Form
    setFormData({
      name: '',
      role: '',
      dept: 'Engineering',
      email: '',
      initialPassword: 'Welcome@' + Math.floor(1000 + Math.random() * 9000),
      shift: 'General Shift (09:30 AM - 06:30 PM)',
      phone: '',
      salary: '₹ 7,50,000'
    });

    showSuccessToast(`Employee created! ID: ${generatedId}`);
  };

  // 2. RESET PASSWORD HANDLER WITH CONFIRM PASSWORD
  const handleOpenResetModal = (emp) => {
    setResetTargetEmp(emp);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPass(false);
    setShowConfirmPass(false);
    setIsResetModalOpen(true);
  };

  const handleExecutePasswordReset = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showErrorToast('Please fill both password fields');
      return;
    }
    if (newPassword.length < 6) {
      showErrorToast('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast('New password and confirm password do not match!');
      return;
    }

    setIsResetModalOpen(false);
    showSuccessToast(`Password successfully reset for ${resetTargetEmp.name}!`);
  };

  // Helper to copy onboarding magic link
  const getMagicLink = (emp) => {
    const origin = window.location.origin;
    return `${origin}/onboard/${emp?.onboardingToken || 'demo_token'}`;
  };

  const handleCopyLink = (emp) => {
    const link = getMagicLink(emp);
    navigator.clipboard.writeText(link);
    showSuccessToast('Onboarding form link copied to clipboard!');
  };

  const handleShareWhatsApp = (emp) => {
    const link = getMagicLink(emp);
    const message = `Hello ${emp.name},\nWelcome to Aayup Technologies! Please complete your official Employee Onboarding Form using this secure link:\n${link}\n\nYour Employee ID is: ${emp.id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Delete employee
  const handleDelete = async (emp) => {
    const res = await showConfirmDialog({
      title: 'Deactivate Employee?',
      text: `Are you sure you want to deactivate ${emp.name} from Aayup Technologies HR registry?`
    });
    if (res.isConfirmed) {
      setEmployees(employees.filter((e) => e.id !== emp.id));
      showSuccessToast(`${emp.name} has been archived.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Workforce Registry & Onboarding</h1>
          <p className="text-xs text-slate-500 font-medium">Manage employees, track 13-section onboarding verification, and generate magic links.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 self-start shrink-0"
        >
          <MdPersonAdd className="text-base" />
          <span>Add Employee & Generate Link</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Total Staff</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{employees.length}</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdGroups className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Onboarding Done</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {employees.filter(e => e.onboardingStatus === 'Completed').length}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdCheckCircle className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Under Review</div>
            <div className="text-2xl font-black text-amber-500 mt-0.5">{underReviewCount}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <MdHourglassTop className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Corrections Flagged</div>
            <div className="text-2xl font-black text-rose-500 mt-0.5">{correctionCount}</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
            <MdErrorOutline className="text-xl" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Search by name, ID or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-sm rounded-xl focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Onboarding Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Onboarding:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Under Review">Under Review</option>
              <option value="Submitted">Submitted</option>
              <option value="Correction Required">Correction Required</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* STRICT SINGLE-LINE NO-WRAP HORIZONTALLY SCROLLABLE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/90 text-slate-700 text-xs uppercase font-extrabold tracking-wider border-b border-slate-200 whitespace-nowrap">
              <tr>
                <th className="px-5 py-3.5">Emp ID</th>
                <th className="px-5 py-3.5">Employee Name</th>
                <th className="px-5 py-3.5">Designation</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Official Email</th>
                <th className="px-5 py-3.5">Joining Date</th>
                <th className="px-5 py-3.5">Onboarding Status</th>
                <th className="px-5 py-3.5">Onboarding Magic Link</th>
                <th className="px-5 py-3.5 text-center sticky right-0 bg-slate-50/95 shadow-[-4px_0_6px_rgba(0,0,0,0.03)] z-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-400 text-sm font-medium">
                    No employees matching search criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition duration-150">
                    {/* Emp ID */}
                    <td className="px-5 py-4 font-bold text-xs text-blue-600">
                      <span className="bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 font-mono">
                        {emp.id}
                      </span>
                    </td>

                    {/* Employee Name */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                          {emp.avatar}
                        </div>
                        <span className="font-extrabold text-slate-900">{emp.name}</span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      {emp.role}
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4 text-xs font-bold text-slate-800">
                      {emp.dept}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MdEmail className="text-slate-400 text-sm shrink-0" />
                        {emp.email}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      {emp.joined}
                    </td>

                    {/* Onboarding Status Badge with Progress */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block ${
                            emp.onboardingStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                              : emp.onboardingStatus === 'Under Review' || emp.onboardingStatus === 'Submitted'
                              ? 'bg-blue-50 text-blue-600 border border-blue-200/50'
                              : emp.onboardingStatus === 'Correction Required'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/50'
                              : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                          }`}
                        >
                          {emp.onboardingStatus}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {emp.onboardingProgress || 10}%
                        </span>
                      </div>
                    </td>

                    {/* Magic Link Direct Quick Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(emp)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                          title="Copy Direct Form Link"
                        >
                          <MdContentCopy className="text-xs" />
                          <span>Copy Link</span>
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(emp)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 border border-emerald-200/60"
                          title="Send to Candidate via WhatsApp"
                        >
                          <FaWhatsapp className="text-xs text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>

                    {/* Prominent Action Buttons - View opens 360 page, Reset opens modal */}
                    <td className="px-5 py-4 text-center sticky right-0 bg-white shadow-[-4px_0_6px_rgba(0,0,0,0.03)] z-10">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Button -> Navigates to Full 360 Employee Details Page */}
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm shadow-blue-600/20"
                          title="Open 360° Employee Details, Verification & Tracking"
                        >
                          <MdVisibility className="text-sm" />
                          <span>View 360°</span>
                        </button>

                        {/* Reset Password Button -> Opens New/Confirm Password Modal */}
                        <button
                          onClick={() => handleOpenResetModal(emp)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                          title="Change / Reset Password with Confirmation"
                        >
                          <MdLockReset className="text-base" />
                          <span>Reset Pass</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Deactivate Employee"
                        >
                          <MdDeleteOutline className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Chakra-style Table Pagination Bar */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
          <div>
            Showing <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-900">
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{' '}
            of <strong className="text-slate-900">{filtered.length}</strong> employees
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <MdKeyboardArrowLeft className="text-base" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <MdKeyboardArrowRight className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. SIMPLIFIED ADD EMPLOYEE MODAL (Takes Basic Details -> Auto Generates ID, Date & Magic Link) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Employee</h3>
                <p className="text-xs text-slate-500">System will auto-generate Employee ID, initial password & onboarding link</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flutter Specialist"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="ankit.s@aayup.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98000 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                  >
                    <option value="General Shift (09:30 AM - 06:30 PM)">General Shift (09:30 AM)</option>
                    <option value="Morning Shift (08:00 AM - 05:00 PM)">Morning Shift (08:00 AM)</option>
                    <option value="Evening Shift (01:00 PM - 10:00 PM)">Evening Shift (01:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/50 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <MdBadge className="text-base text-blue-600" />
                  <span>Auto Generated Credentials:</span>
                </div>
                <div className="text-[11px] text-blue-700">
                  Initial Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">{formData.initialPassword}</code>
                </div>
                <div className="text-[11px] text-blue-600">
                  Joining Date will be locked as today, and a secure Onboarding Link will be generated immediately.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  Confirm & Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ONBOARDING SUCCESS & MAGIC LINK SHARE POPUP */}
      {isOnboardingSuccessModalOpen && newlyCreatedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 text-2xl font-bold">
              ✓
            </div>

            <h3 className="text-xl font-black text-slate-900">Employee Created & ID Generated!</h3>
            <p className="text-xs text-slate-500 mt-1">
              New employee profile added to registry. Share the onboarding magic link with the candidate to fill all 13 sections.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Employee ID:</span>
                <span className="font-mono font-bold text-blue-600 text-sm">{newlyCreatedEmp.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">{newlyCreatedEmp.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Designation:</span>
                <span className="font-semibold text-slate-800">{newlyCreatedEmp.role} ({newlyCreatedEmp.dept})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Corporate Email:</span>
                <span className="font-semibold text-slate-800">{newlyCreatedEmp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Initial Password:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{newlyCreatedEmp.initialPassword || 'Welcome@2026'}</span>
              </div>
            </div>

            {/* Generated Magic Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">13-Section Onboarding Form Link:</label>
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={getMagicLink(newlyCreatedEmp)}
                  className="bg-transparent text-xs text-slate-700 font-mono flex-1 outline-none truncate"
                />
                <button
                  onClick={() => handleCopyLink(newlyCreatedEmp)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-sm flex items-center gap-1 shrink-0"
                >
                  <MdContentCopy /> Copy
                </button>
              </div>
            </div>

            {/* Action Buttons: WhatsApp Share & Finish */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleShareWhatsApp(newlyCreatedEmp)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <FaWhatsapp className="text-base" />
                <span>Send to WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  window.open(getMagicLink(newlyCreatedEmp), '_blank');
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Open Form View
              </button>
              <button
                onClick={() => setIsOnboardingSuccessModalOpen(false)}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESET PASSWORD MODAL (New Password + Confirm Password with Eye Toggle) */}
      {isResetModalOpen && resetTargetEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <MdLockReset className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Reset Employee Password</h3>
                  <p className="text-xs text-slate-500">{resetTargetEmp.name} ({resetTargetEmp.id})</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecutePasswordReset} className="mt-5 space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password *</label>
                <div className="relative">
                  <MdLockOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password *</label>
                <div className="relative">
                  <MdLockOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800">
                ⚠️ Updating password will require the employee to log in with new credentials on both AayupOnes Mobile App and Web.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition"
                >
                  Update & Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
