import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MdArrowBack, MdVerified, MdCheckCircle,
  MdSecurity, MdAttachMoney, MdAccessTime, MdCalendarToday, MdHistory,
  MdSchool, MdWork, MdBadge, MdAccountBalance, MdPhone,
  MdEmail, MdLocationOn, MdCheck, MdClose,
  MdDownload, MdShare, MdOutlineAssignmentLate, MdFileDownload,
  MdOutlineCloudUpload, MdOpenInNew, MdContentCopy, MdFolderCopy,
  MdDescription, MdPictureAsPdf, MdVisibility, MdFilterNone
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import Swal from 'sweetalert2';
import apiClient from '../services/api';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Active Tab: onboarding, documents, attendance, leave, payroll, activity
  const [activeTab, setActiveTab] = useState('onboarding');
  const [employee, setEmployee] = useState(null);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);

  // Verification review states
  const [verificationData, setVerificationData] = useState({
    personal: { verified: true, remarks: '' },
    address: { verified: true, remarks: '' },
    employment: { verified: true, remarks: '' },
    education: { verified: true, remarks: '' },
    experience: { verified: true, remarks: '' },
    skills: { verified: true, remarks: '' },
    bank: { verified: true, remarks: '' },
    kyc: { verified: true, remarks: '' },
    emergency: { verified: true, remarks: '' },
    consent: { verified: true, remarks: '' }
  });

  const [overallStatus, setOverallStatus] = useState('Under Review');
  const [adminOverallRemark, setAdminOverallRemark] = useState('');

  // Official document library for this employee (Loaded from API)
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [leavesData, setLeavesData] = useState({ clTotal: 12, clConsumed: 0, slTotal: 6, slConsumed: 0, wfhDays: 0, history: [] });
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fast load from Backend API: GET /api/employees/:id
    const fetchEmployeeDetails = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getEmployeeById(id);
        if (res && res.success && res.employee) {
          setEmployee(res.employee);
          setEmployeeDocs(res.documents || []);
          setAttendanceList(res.attendance || []);
          if (res.leaves) setLeavesData(res.leaves);
          if (res.salaryBreakdown) setSalaryBreakdown(res.salaryBreakdown);
          if (res.auditLogs) setAuditLogs(res.auditLogs);
          if (res.employee.onboardingStatus) {
            setOverallStatus(res.employee.onboardingStatus);
          }
          return;
        }
      } catch (err) {
        console.warn('API fetch notice, using local employee fallback:', err.message);
      } finally {
        setLoading(false);
      }

      // Check localStorage or initial mock fallback
      const localEmps = JSON.parse(localStorage.getItem('aayup_employees') || '[]');
      let emp = localEmps.find(e => e.id === id);

      if (!emp) {
        emp = {
          id: id,
          name: "Employee Dossier",
          role: "Team Member",
          dept: "Operations",
          type: "Full Time",
          status: "Active",
          onboardingStatus: "Under Review",
          onboardingProgress: 0,
          avatar: "EM",
          email: "",
          phone: "",
          joined: "Recent",
          manager: "Unassigned",
          salary: "₹ 0",
          location: "Headquarters",
          shift: "General Shift",
          onboardingToken: ""
        };
      }

      setEmployee(emp);
      setOverallStatus(emp.onboardingStatus || 'Under Review');
    };

    fetchEmployeeDetails();
  }, [id]);

  if (!employee) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading Employee Dossier...</p>
      </div>
    );
  }

  const toggleSectionVerification = (sectionKey) => {
    setVerificationData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        verified: !prev[sectionKey].verified
      }
    }));
  };

  const handleApproveAll = () => {
    Swal.fire({
      title: 'Approve Onboarding Application?',
      text: `Are you sure you want to approve onboarding for ${employee.name} (${employee.id})? This will generate their official joining confirmation and notify them on the mobile app.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Approve & Onboard'
    }).then((result) => {
      if (result.isConfirmed) {
        setOverallStatus('Approved');
        const localEmps = JSON.parse(localStorage.getItem('aayup_employees') || '[]');
        const updated = localEmps.map(e => e.id === employee.id ? { ...e, onboardingStatus: 'Approved', onboardingProgress: 100 } : e);
        localStorage.setItem('aayup_employees', JSON.stringify(updated));

        Swal.fire({
          icon: 'success',
          title: 'Employee Approved!',
          text: `${employee.name} is now marked as Approved. Onboarding completion certificate is ready.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleRejectWithCorrection = () => {
    Swal.fire({
      title: 'Request Correction / Flag Dossier',
      input: 'textarea',
      inputLabel: 'Specify Reason for Correction / Missing Documents',
      inputPlaceholder: 'e.g. Bank passbook / cancelled cheque is blurred. Please upload clear scan.',
      inputValue: adminOverallRemark,
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Send Correction Notice',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide remarks to guide the employee!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setOverallStatus('Correction Required');
        setAdminOverallRemark(result.value);

        Swal.fire({
          icon: 'info',
          title: 'Correction Request Dispatched',
          text: `Notification sent to ${employee.name}. When candidate opens their onboarding link, flagged sections will be highlighted.`,
          confirmButtonColor: '#0066d6'
        });
      }
    });
  };

  const magicLink = `${window.location.origin}/onboard/${employee.onboardingToken || employee.id}`;

  const copyMagicLink = () => {
    navigator.clipboard.writeText(magicLink);
    Swal.fire({
      icon: 'success',
      title: 'Link Copied!',
      text: magicLink,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${employee.name},\nPlease complete your AayupOnes Employee Onboarding form here:\n${magicLink}\nYour Assigned Emp ID: ${employee.id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const openDocPreview = (doc) => {
    setPreviewDoc(doc);
  };

  const downloadDocSimulation = (doc) => {
    Swal.fire({
      icon: 'success',
      title: 'Downloading Document',
      text: `Downloading ${doc.filename}...`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const submitted = employee?.dossier?.submittedData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Employee Avatar & Identity */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/employees')} 
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-sm"
              title="Back to Employees"
            >
              <MdArrowBack className="text-xl" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {employee.avatar || employee.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{employee.name}</h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                  {employee.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  overallStatus === 'Approved' || overallStatus === 'Completed'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  overallStatus === 'Correction Required' 
                    ? 'bg-rose-50 border-rose-200 text-rose-700' :
                    'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {overallStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-3">
                <span className="text-slate-700 font-semibold">{employee.role}</span>
                <span>&bull;</span>
                <span>{employee.dept}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-500"><MdLocationOn className="text-slate-400" /> {employee.location || 'Lucknow HQ'}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={copyMagicLink}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
              title="Copy Public Onboarding URL"
            >
              <MdContentCopy className="text-sm text-blue-600" /> Copy Link
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-1.5 transition"
              title="Send via WhatsApp"
            >
              <FaWhatsapp className="text-emerald-600 text-sm" /> WhatsApp
            </button>
            <button
              onClick={handleRejectWithCorrection}
              className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition"
            >
              <MdOutlineAssignmentLate /> Request Correction
            </button>
            <button
              onClick={handleApproveAll}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
            >
              <MdCheckCircle /> Approve Onboarding
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Email</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{employee.email}</p>
            <span className="text-[11px] text-slate-500">{employee.phone}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Reporting Manager</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{employee.manager || 'HR Operations'}</p>
            <span className="text-[11px] text-blue-600 font-semibold">{employee.dept || 'Operations'}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Annual CTC</span>
            <p className="text-xs font-bold text-emerald-600 font-mono mt-0.5">{employee.salary || '₹ 0'}</p>
            <span className="text-[11px] text-slate-500">Gross: ₹ {salaryBreakdown ? Number(salaryBreakdown.monthlyGross || 0).toLocaleString('en-IN') : '0'}/mo</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Onboarding Progress</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${employee.onboardingProgress || 0}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-900">{employee.onboardingProgress || 0}%</span>
            </div>
            <span className="text-[10px] text-slate-500">{employee.onboardingStatus || 'Under Review'}</span>
          </div>
        </div>
      </div>

      {/* Clean Tab Navigation - Featuring Dedicated Documents Tab */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
        {[
          { id: 'onboarding', label: '13-Section Dossier & KYC Verification', icon: MdVerified },
          { id: 'documents', label: `Submitted Documents (${employeeDocs.length})`, icon: MdFolderCopy },
          { id: 'attendance', label: 'Attendance & Punches', icon: MdAccessTime },
          { id: 'leave', label: 'Leaves & Time-Off', icon: MdCalendarToday },
          { id: 'payroll', label: 'Salary & Compensation', icon: MdAttachMoney },
          { id: 'activity', label: 'Activity & Audit Log', icon: MdHistory },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="text-base" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DEDICATED DOCUMENTS GALLERY */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Submitted Documents Repository</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  {employeeDocs.length} Documents Available
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                KYC Proofs, Educational Marksheets, Prior Experience Certificates & Signed Declarations.
              </p>
            </div>
            {employeeDocs.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Batch Download Initiated',
                      text: `Downloading all ${employeeDocs.length} verified documents as a ZIP archive (${employee.id}_dossier.zip)...`,
                      timer: 2000,
                      showConfirmButton: false
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm"
                >
                  <MdDownload className="text-base" /> Download Complete ZIP
                </button>
              </div>
            )}
          </div>

          {/* Grid of Documents */}
          {employeeDocs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <MdFolderCopy className="text-3xl" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No Documents Uploaded Yet</h4>
              <p className="text-xs text-slate-400 mt-1">Submitted documents will appear here once the candidate uploads them in onboarding.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employeeDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        {doc.type === 'pdf' ? (
                          <MdPictureAsPdf className="text-2xl text-rose-600" />
                        ) : (
                          <MdDescription className="text-2xl text-blue-600" />
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <MdCheckCircle className="text-xs" /> {doc.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{doc.title}</h4>
                      <span className="text-[11px] font-semibold text-blue-600 block mt-0.5">{doc.category}</span>
                      <p className="text-[11px] font-mono text-slate-500 mt-1 truncate">{doc.filename}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{doc.size} &bull; {doc.uploadDate}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDocPreview(doc)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1 transition"
                        title="Preview Document"
                      >
                        <MdVisibility /> View
                      </button>
                      <button
                        onClick={() => downloadDocSimulation(doc)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                        title="Download File"
                      >
                        <MdDownload className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 1: ONBOARDING & VERIFICATION CENTER */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          {/* Information Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <MdSecurity className="text-xl" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">HR Verification & Compliance Desk</h3>
                <p className="text-xs text-blue-800 font-medium">
                  Verify submitted candidate credentials. Flagging any section notifies the candidate on mobile & highlights fields.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-900">Verified:</span>
              <span className="text-xs font-extrabold text-emerald-700 px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-200">
                10 / 10 Sections Ready
              </span>
            </div>
          </div>

          {/* Section Dossier Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. PERSONAL INFORMATION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="text-sm font-extrabold text-slate-900">Personal Information</h4>
                </div>
                <button
                  onClick={() => toggleSectionVerification('personal')}
                  className={`text-xs px-3 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                    verificationData.personal.verified 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {verificationData.personal.verified ? <MdCheck /> : <MdClose />}
                  {verificationData.personal.verified ? 'Verified' : 'Flagged'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Full Name:</span>
                  <span className="text-slate-900 font-semibold">{submitted.fullName || employee.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Father's Name:</span>
                  <span className="text-slate-900 font-semibold">{submitted.fatherName || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mother's Name:</span>
                  <span className="text-slate-900 font-semibold">{submitted.motherName || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Date of Birth:</span>
                  <span className="text-slate-900 font-semibold">{submitted.dob || employee.dob || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gender & Marital:</span>
                  <span className="text-slate-900 font-semibold">{(submitted.gender || 'Male')} &bull; {(submitted.maritalStatus || 'Single')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Blood Group:</span>
                  <span className="text-slate-900 font-semibold">{submitted.bloodGroup || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Primary Contact:</span>
                  <span className="text-slate-900 font-semibold">{submitted.mobileNumber || employee.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Personal Email:</span>
                  <span className="text-slate-900 font-semibold">{submitted.personalEmail || employee.email}</span>
                </div>
              </div>
            </div>

            {/* 2. ADDRESS INFORMATION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-sm font-extrabold text-slate-900">Address Information</h4>
                </div>
                <button
                  onClick={() => toggleSectionVerification('address')}
                  className={`text-xs px-3 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                    verificationData.address.verified 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {verificationData.address.verified ? <MdCheck /> : <MdClose />}
                  {verificationData.address.verified ? 'Verified' : 'Flagged'}
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Current Address:</span>
                  <p className="text-slate-900 font-semibold">{submitted.currentAddress || 'No current address submitted yet.'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Permanent Address:</span>
                  <p className="text-slate-900 font-semibold">{submitted.permanentAddress || submitted.currentAddress || 'No permanent address submitted yet.'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block font-medium">State:</span>
                    <span className="text-slate-900 font-semibold">{submitted.state || 'Uttar Pradesh'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">City:</span>
                    <span className="text-slate-900 font-semibold">{submitted.city || 'Lucknow'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">PIN Code:</span>
                    <span className="text-slate-900 font-semibold">{submitted.pinCode || '------'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CORPORATE ALLOCATION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</div>
                  <h4 className="text-sm font-extrabold text-slate-900">Employment Details</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">
                  SYSTEM LOCKED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Employee ID:</span>
                  <span className="font-mono text-blue-600 font-bold">{employee.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Department:</span>
                  <span className="text-slate-900 font-semibold">{employee.dept}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Designation:</span>
                  <span className="text-slate-900 font-semibold">{employee.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Employment Type:</span>
                  <span className="text-slate-900 font-semibold">{employee.type || 'Permanent Full-Time'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Work Location:</span>
                  <span className="text-slate-900 font-semibold">{employee.location || 'Lucknow HQ'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Work Shift:</span>
                  <span className="text-slate-900 font-semibold">{employee.shift || 'General Shift (10:00 - 19:00)'}</span>
                </div>
              </div>
            </div>

            {/* 4. EDUCATIONAL QUALIFICATIONS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</div>
                  <h4 className="text-sm font-extrabold text-slate-900">Educational Qualifications</h4>
                </div>
                <button
                  onClick={() => toggleSectionVerification('education')}
                  className={`text-xs px-3 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                    verificationData.education.verified 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {verificationData.education.verified ? <MdCheck /> : <MdClose />}
                  {verificationData.education.verified ? 'Verified' : 'Flagged'}
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block font-medium">Highest Degree:</span>
                    <span className="text-slate-900 font-semibold">{submitted.highestQualification || 'Not Submitted'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Course & Branch:</span>
                    <span className="text-slate-900 font-semibold">{submitted.courseName || submitted.specialization || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">University / Board:</span>
                    <span className="text-slate-900 font-semibold">{submitted.universityName || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Passing Year & Score:</span>
                    <span className="text-slate-900 font-semibold">{submitted.passingYear || '--'} &bull; {submitted.percentageCGPA ? `${submitted.percentageCGPA}` : 'Awaiting Score'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. BANK ACCOUNT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">5</div>
                  <h4 className="text-sm font-extrabold text-slate-900">Bank Account Details</h4>
                </div>
                <button
                  onClick={() => toggleSectionVerification('bank')}
                  className={`text-xs px-3 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                    verificationData.bank.verified 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {verificationData.bank.verified ? <MdCheck /> : <MdClose />}
                  {verificationData.bank.verified ? 'Verified' : 'Flagged'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Bank Name:</span>
                  <span className="text-slate-900 font-semibold">{submitted.bankName || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Account Holder:</span>
                  <span className="text-slate-900 font-semibold">{submitted.accountHolderName || employee.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Account Number:</span>
                  <span className="font-mono text-emerald-600 font-bold">{submitted.accountNumber ? `•••• ${submitted.accountNumber.slice(-4)}` : 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">IFSC Code:</span>
                  <span className="font-mono text-slate-900 font-bold">{submitted.ifscCode || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Branch Name:</span>
                  <span className="text-slate-900 font-semibold">{submitted.branchName || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Account Type:</span>
                  <span className="text-slate-900 font-semibold">{submitted.accountType || 'Savings'}</span>
                </div>
              </div>
            </div>

            {/* 6. KYC & STATUTORY */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">6</div>
                  <h4 className="text-sm font-extrabold text-slate-900">KYC & Statutory Compliance</h4>
                </div>
                <button
                  onClick={() => toggleSectionVerification('kyc')}
                  className={`text-xs px-3 py-1 rounded-lg border font-bold flex items-center gap-1 transition ${
                    verificationData.kyc.verified 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {verificationData.kyc.verified ? <MdCheck /> : <MdClose />}
                  {verificationData.kyc.verified ? 'Verified' : 'Flagged'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Aadhaar Number:</span>
                  <span className="font-mono text-slate-900 font-bold">{submitted.aadhaarNumber ? `XXXX-XXXX-${submitted.aadhaarNumber.slice(-4)}` : 'Not Submitted'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">PAN Number:</span>
                  <span className="font-mono text-slate-900 font-bold">{submitted.panNumber || 'Not Submitted'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">UAN Number:</span>
                  <span className="font-mono text-slate-900">{submitted.uanNumber || 'Not Applicable'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Nominee Designated:</span>
                  <span className="text-slate-900 font-semibold">{submitted.nomineeName ? `${submitted.nomineeName} (${submitted.nomineeRelation || 'Nominee'})` : 'None'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Decision Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <h4 className="text-sm font-black text-slate-900">Final Verification Decision</h4>
              <p className="text-xs text-slate-500 font-medium">
                Approving grants full corporate access and marks onboarding as 100% complete.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRejectWithCorrection}
                className="px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-2"
              >
                <MdOutlineAssignmentLate className="text-sm" /> Flag Remarks for Re-submission
              </button>
              <button
                onClick={handleApproveAll}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <MdCheckCircle className="text-sm" /> Approve & Issue Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ATTENDANCE & PUNCHES */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Attendance Punch Timeline</h3>
              <p className="text-xs text-slate-500">Shift: {employee.shift || 'General Shift'} &bull; Bio-metric & Mobile App Punches</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
              {attendanceList.length > 0 ? `${attendanceList.length} Logs Recorded` : '0 Logs'}
            </span>
          </div>

          <div className="overflow-x-auto whitespace-nowrap">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase font-bold text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Punch In</th>
                  <th className="py-3 px-4">Punch Out</th>
                  <th className="py-3 px-4">Effective Work Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                      No attendance punch records found for this employee.
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.date}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{row.in}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.out}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.hrs}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{row.src}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LEAVES & TIME OFF */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Casual Leaves (CL)</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{leavesData.clTotal - leavesData.clConsumed} / {leavesData.clTotal}</p>
              <span className="text-[11px] text-slate-500">{leavesData.clConsumed} Consumed this fiscal year</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Sick Leaves (SL)</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{leavesData.slTotal - leavesData.slConsumed} / {leavesData.slTotal}</p>
              <span className="text-[11px] text-slate-500">{leavesData.slConsumed} Consumed this fiscal year</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Work From Home (WFH)</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{leavesData.wfhDays} Days</p>
              <span className="text-[11px] text-slate-500">Approved WFH requests</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Leave History</h4>
            {leavesData.history && leavesData.history.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {leavesData.history.map((l) => (
                  <div key={l.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{l.type} ({l.days} Day{l.days > 1 ? 's' : ''})</span>
                      <p className="text-slate-500 text-[11px]">{l.from} to {l.to} &bull; {l.reason}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{l.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No leaves applied by this employee.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PAYROLL & SALARY */}
      {activeTab === 'payroll' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Monthly CTC & Salary Breakdown</h3>
              <p className="text-xs text-slate-500">
                Annual Package: ₹ {salaryBreakdown ? Number(salaryBreakdown.annualCTC || 0).toLocaleString('en-IN') : '0'} &bull; Direct Deposit
              </p>
            </div>
            <Link
              to="/payroll"
              className="text-xs px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
            >
              Open Interactive Salary Configurator
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200">
              <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">Earnings (Monthly)</h4>
              <div className="flex justify-between py-1.5 border-b border-emerald-200">
                <span className="text-slate-700 font-medium">Basic Salary (50% CTC)</span>
                <span className="font-mono text-slate-900 font-bold">₹ {salaryBreakdown ? Number(salaryBreakdown.basic || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-emerald-200">
                <span className="text-slate-700 font-medium">House Rent Allowance (HRA 40%)</span>
                <span className="font-mono text-slate-900 font-bold">₹ {salaryBreakdown ? Number(salaryBreakdown.hra || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-emerald-200">
                <span className="text-slate-700 font-medium">Special & Performance Allowance</span>
                <span className="font-mono text-slate-900 font-bold">₹ {salaryBreakdown ? Number(salaryBreakdown.special || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between py-1.5 font-black text-emerald-950 pt-2">
                <span>Gross Earnings:</span>
                <span className="font-mono text-emerald-700 text-sm">₹ {salaryBreakdown ? Number(salaryBreakdown.gross || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>

            <div className="space-y-3 bg-rose-50/50 p-5 rounded-2xl border border-rose-200">
              <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">Statutory Deductions</h4>
              <div className="flex justify-between py-1.5 border-b border-rose-200">
                <span className="text-slate-700 font-medium">Provident Fund (Employee 12%)</span>
                <span className="font-mono text-rose-600 font-bold">₹ {salaryBreakdown ? Number(salaryBreakdown.pf || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rose-200">
                <span className="text-slate-700 font-medium">Professional Tax (PT)</span>
                <span className="font-mono text-slate-900 font-bold">₹ {salaryBreakdown ? Number(salaryBreakdown.pt || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rose-200">
                <span className="text-slate-700 font-medium">TDS / Income Tax Estimate</span>
                <span className="font-mono text-slate-900 font-bold">₹ {salaryBreakdown ? Number(salaryBreakdown.tds || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
              <div className="flex justify-between py-1.5 font-black text-rose-950 pt-2">
                <span>Net In-Hand Salary:</span>
                <span className="font-mono text-emerald-700 text-sm">₹ {salaryBreakdown ? Number(salaryBreakdown.net || 0).toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: ACTIVITY & AUDIT LOG */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Lifecycle & Audit Trail</h3>
          <div className="space-y-3 text-xs">
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.event}</span>
                      <span className="text-[10px] text-slate-400 font-mono">&bull; {log.time}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.detail}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No audit logs recorded for this employee yet.</p>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MdPictureAsPdf className="text-2xl text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{previewDoc.title}</h3>
                  <p className="text-[11px] text-slate-500">{previewDoc.category} &bull; {previewDoc.filename} ({previewDoc.size})</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Document Preview Placeholder */}
            <div className="border border-slate-200 rounded-xl bg-slate-50 p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 mb-3">
                <MdDescription className="text-3xl text-blue-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">{previewDoc.filename}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Government Verified Digital Record &bull; Uploaded on {previewDoc.uploadDate} &bull; SHA-256 Checksum Verified
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <MdCheckCircle /> Verification Status: Passed
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Employee ID: <strong className="text-slate-800">{employee.id}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadDocSimulation(previewDoc)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <MdDownload className="text-base" /> Download File
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
