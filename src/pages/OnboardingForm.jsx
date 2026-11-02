import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MdSecurity, MdCheckCircle, MdArrowForward, MdArrowBack, 
  MdSave, MdSend, MdCloudUpload, MdInfo, MdLock, MdPhone,
  MdEmail, MdBadge, MdCorporateFare, MdLocationOn, MdSchool,
  MdWork, MdCode, MdAccountBalance, MdCheck,
  MdAssignmentTurnedIn, MdFolderZip, MdFileDownload
} from 'react-icons/md';
import Swal from 'sweetalert2';
import { initialEmployees } from '../data/mockData';

const ONBOARDING_SECTIONS = [
  { id: 1, title: 'Personal Info', desc: 'Family & Identity' },
  { id: 2, title: 'Address Details', desc: 'Current & Permanent' },
  { id: 3, title: 'Employment Details', desc: 'Role, Shift & Dept' },
  { id: 4, title: 'Educational Info', desc: 'Degrees & Marksheets' },
  { id: 5, title: 'Experience Details', desc: 'Fresher / Experienced' },
  { id: 6, title: 'Technical Skills', desc: 'Stack & Portfolios' },
  { id: 7, title: 'Bank Account', desc: 'Payroll Transfer & IFSC' },
  { id: 8, title: 'Statutory & KYC', desc: 'Aadhaar, PAN & Nominee' },
  { id: 9, title: 'Emergency & Additional', desc: 'Contacts & Language' },
  { id: 10, title: 'Declaration & Submit', desc: 'Consent & Verification' },
];

export default function OnboardingForm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Section 1: Personal
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    maritalStatus: 'Single',
    mobileNumber: '',
    altMobileNumber: '',
    personalEmail: '',
    bloodGroup: 'B+',
    nationality: 'Indian',

    // Section 2: Address
    currentAddress: '',
    permanentAddress: '',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    district: 'Lucknow',
    pinCode: '',
    sameAsCurrent: false,

    // Section 3: Employment (Locked from Admin)
    employeeType: 'Experienced',
    employeeId: '',
    department: '',
    designation: '',
    jobRole: '',
    employmentType: 'Full-Time',
    workLocation: 'Office (Lucknow HQ)',
    joiningDate: '',
    reportingManager: 'Vikram Singh (Head of Tech)',
    teamProject: 'Core Products',
    workShift: 'General Shift (10:00 AM - 07:00 PM)',
    probationPeriod: '3 Months',

    // Section 4: Education
    highestQualification: 'B.Tech / B.E.',
    courseName: 'Computer Science & Engineering',
    specialization: 'Information Technology',
    universityName: 'AKTU',
    collegeName: '',
    passingYear: '2023',
    percentageCGPA: '',
    hasEducationGap: 'No',
    educationGapReason: '',

    // Section 5: Experience
    experienceLevel: 'Experienced',
    internshipDone: 'Yes',
    internshipCompany: '',
    internshipRole: '',
    internshipDuration: '6 Months',
    academicProjects: '',
    totalExpYears: '2',
    totalExpMonths: '6',
    prevCompany: '',
    prevDesignation: '',
    prevCTC: '',
    expectedCTC: '',
    prevManagerContact: '',

    // Section 6: Tech Skills
    primarySkills: 'React, Node.js, TailwindCSS',
    secondarySkills: 'Flutter, PostgreSQL, Docker',
    progLanguages: 'JavaScript, TypeScript, Python',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',

    // Section 7: Bank
    accountHolderName: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: 'HDFC0001234',
    branchName: 'Hazratganj, Lucknow',
    accountType: 'Savings',

    // Section 8: KYC & Compliance
    aadhaarNumber: '',
    panNumber: '',
    passportNumber: '',
    uanNumber: '',
    esicNumber: '',
    nomineeName: '',
    nomineeRelation: 'Parent',
    nomineeDOB: '',
    nomineeContact: '',

    // Section 9: Emergency & Additional
    emergencyName: '',
    emergencyRelation: 'Father',
    emergencyPhone: '',
    emergencyAddress: '',
    prefLanguage: 'Hindi, English',
    wfhAvailable: 'Yes',
    relocationAvailable: 'Yes',
    medicalEmergencyNote: 'None',

    // Section 10: Consent
    consentAllAccuracy: false,
    consentBackgroundVerification: false,
    consentNDA: false,
    consentCodeOfConduct: false,
    empSignature: '',
    submissionDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    let found = initialEmployees.find(e => e.onboardingToken === token || e.id === token);
    const localEmps = JSON.parse(localStorage.getItem('aayup_employees') || '[]');
    const localFound = localEmps.find(e => e.onboardingToken === token || e.id === token);
    
    const emp = localFound || found || {
      id: "AAYUP-EMP-2026-0024",
      name: "Rahul Kumar",
      email: "rahul.k@aayup.com",
      role: "Senior React & Mobile Developer",
      dept: "Engineering",
      joined: "14 Jan 2024",
      shift: "General Shift (10:00 AM - 07:00 PM)",
      onboardingStatus: "Under Review"
    };

    setEmployee(emp);

    setFormData(prev => ({
      ...prev,
      fullName: emp.name || '',
      personalEmail: emp.email || '',
      employeeId: emp.id || '',
      department: emp.dept || '',
      designation: emp.role || '',
      jobRole: emp.role || '',
      joiningDate: emp.joined || '',
      workShift: emp.shift || prev.workShift,
      accountHolderName: emp.name || ''
    }));

    if (emp.onboardingStatus === 'Approved' || emp.onboardingStatus === 'Completed') {
      setIsSubmitted(true);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'sameAsCurrent' && checked) {
        updated.permanentAddress = updated.currentAddress;
      }
      return updated;
    });
  };

  const calculateCompletion = () => {
    let completedFields = 0;
    const requiredKeys = [
      'fullName', 'fatherName', 'dob', 'mobileNumber', 'currentAddress',
      'pinCode', 'employeeId', 'highestQualification', 'accountNumber',
      'ifscCode', 'aadhaarNumber', 'panNumber', 'emergencyName', 'emergencyPhone'
    ];
    requiredKeys.forEach(k => {
      if (formData[k] && formData[k].toString().trim().length > 0) completedFields++;
    });
    if (formData.consentAllAccuracy && formData.consentNDA) completedFields += 2;
    return Math.min(100, Math.round((completedFields / (requiredKeys.length + 2)) * 100));
  };

  const completionPct = calculateCompletion();

  const handleNext = () => {
    if (currentStep === 1 && (!formData.fullName || !formData.mobileNumber)) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields Missing',
        text: 'Please provide at least your full name and primary mobile number.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }
    if (currentStep < 10) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`onboard_draft_${token}`, JSON.stringify(formData));
    Swal.fire({
      icon: 'success',
      title: 'Progress Saved as Draft!',
      text: 'Your entries are saved. You can continue anytime using this link.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consentAllAccuracy || !formData.consentNDA) {
      Swal.fire({
        icon: 'error',
        title: 'Consent Required',
        text: 'Please accept the mandatory Declaration & NDA clauses to submit.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      const submission = {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
        progress: 100
      };
      localStorage.setItem(`onboard_sub_${employee?.id || token}`, JSON.stringify(submission));

      Swal.fire({
        icon: 'success',
        title: 'Onboarding Submitted Successfully!',
        html: `<b>Welcome aboard ${formData.fullName}!</b><br/>Your dossier and KYC documents have been transmitted to HR Operations for verification.`,
        confirmButtonColor: '#0284c7'
      });
    }, 1200);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <MdCheckCircle className="text-5xl" />
          </div>

          <span className="px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
            Status: Under HR Verification
          </span>

          <h2 className="text-2xl font-black text-slate-900 mt-4 mb-2 tracking-tight">Onboarding Application Submitted!</h2>
          <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
            Congratulations <span className="text-slate-900 font-bold">{formData.fullName}</span>! Your complete 13-section onboarding profile for Employee ID <span className="text-blue-600 font-mono font-bold">{formData.employeeId}</span> is now queued for verification by the HR Operations Team.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs text-slate-600 space-y-2.5 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Department:</span>
              <span className="font-bold text-slate-800">{formData.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Designation:</span>
              <span className="font-bold text-slate-800">{formData.designation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Reporting Manager:</span>
              <span className="font-bold text-slate-800">{formData.reportingManager}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Joining Date:</span>
              <span className="font-bold text-slate-800">{formData.joiningDate}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/login"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              Go to Employee Portal Login
            </Link>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Review My Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Card in Enterprise White Theme */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 text-sm">
              A1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">AayupOnes</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md uppercase tracking-wide">
                  IT Onboarding Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Employee Digital Dossier & KYC Verification</p>
            </div>
          </div>

          {/* Locked Employee Quick Bar */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Candidate</span>
              <span className="font-bold text-slate-800">{formData.fullName || 'Candidate'}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Employee ID</span>
              <span className="font-mono text-blue-600 font-bold">{formData.employeeId || 'AAYUP-EMP-PENDING'}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Progress</span>
              <span className="font-bold text-emerald-600">{completionPct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <MdSave className="text-sm text-blue-600" /> Save Draft
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="max-w-7xl mx-auto mt-2.5">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Step Navigator Card */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 px-2">
              Onboarding Checklist
            </h3>
            <div className="space-y-1">
              {ONBOARDING_SECTIONS.map((sec) => {
                const isActive = currentStep === sec.id;
                const isPassed = currentStep > sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setCurrentStep(sec.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition ${
                      isActive 
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20' 
                        : isPassed 
                        ? 'text-slate-700 hover:bg-slate-50 font-semibold' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isActive 
                        ? 'bg-white text-blue-600' 
                        : isPassed 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {isPassed ? <MdCheck className="text-xs" /> : sec.id}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{sec.title}</p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {sec.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 font-medium flex items-start gap-2">
                <MdLock className="text-blue-600 shrink-0 text-sm mt-0.5" />
                <p>Company details (Role, ID, Joining Date) are verified and locked by Admin.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
            
            {/* Step Top Bar */}
            <div className="border-b border-slate-100 pb-5 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">
                  Step {currentStep} of 10
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                  {ONBOARDING_SECTIONS[currentStep - 1]?.title}
                </h2>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  {ONBOARDING_SECTIONS[currentStep - 1]?.desc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1"
                >
                  <MdArrowBack /> Previous
                </button>
                {currentStep < 10 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1"
                  >
                    Next Step <MdArrowForward />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Final Application'} <MdCheckCircle />
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields Container */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* SECTION 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 font-medium flex items-center gap-2">
                    <MdInfo className="text-base text-blue-600 shrink-0" />
                    Enter your official details as per your Government ID (Aadhaar / Passport).
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                        placeholder="Rahul Kumar"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name *</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                        placeholder="Father's full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                        placeholder="Mother's full name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Primary Mobile *</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alternate Mobile</label>
                      <input
                        type="tel"
                        name="altMobileNumber"
                        value={formData.altMobileNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                        placeholder="+91 98765 00000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Personal Email *</label>
                      <input
                        type="email"
                        name="personalEmail"
                        value={formData.personalEmail}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                        placeholder="youremail@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Photo Upload Box */}
                  <div className="border border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 text-center">
                    <MdCloudUpload className="text-3xl text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-700 font-bold">Upload Formal Passport Size Photograph (JPG, PNG)</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Recommended 3.5cm x 4.5cm white background. Max size 2MB.</p>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs text-slate-700 font-bold cursor-pointer transition shadow-sm">
                      Browse File
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION 2: ADDRESS INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Residential Address *</label>
                    <textarea
                      name="currentAddress"
                      value={formData.currentAddress}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      placeholder="Flat/House No., Building, Street, Area"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="sameAsCurrent"
                      name="sameAsCurrent"
                      checked={formData.sameAsCurrent}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="sameAsCurrent" className="text-xs text-slate-700 font-medium cursor-pointer">
                      Permanent Address is same as Current Address
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Residential Address *</label>
                    <textarea
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      disabled={formData.sameAsCurrent}
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-50 font-medium"
                      placeholder="Village / Town, Landmark, Native Address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City / District *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="226001"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: EMPLOYMENT (SYSTEM LOCKED) */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 font-medium flex items-center gap-2">
                    <MdLock className="text-base text-amber-600 shrink-0" />
                    Notice: Corporate attributes are assigned by HR Admin and are locked for compliance.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Company Assigned Employee ID</label>
                      <div className="flex items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-blue-600 font-bold">
                        <MdBadge className="mr-2 text-blue-600" />
                        {formData.employeeId}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                      <div className="flex items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold">
                        <MdCorporateFare className="mr-2 text-slate-400" />
                        {formData.department}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Designation & Role</label>
                      <div className="flex items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold">
                        <MdWork className="mr-2 text-slate-400" />
                        {formData.designation}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Joining Date</label>
                      <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold">
                        {formData.joiningDate}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Reporting Manager</label>
                      <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold">
                        {formData.reportingManager}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Work Shift</label>
                      <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold">
                        {formData.workShift}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Employee Type *</label>
                      <select
                        name="employeeType"
                        value={formData.employeeType}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="Experienced">Experienced Professional</option>
                        <option value="Fresher">Fresher / Graduate</option>
                        <option value="Intern">Intern / Trainee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Work Location *</label>
                      <select
                        name="workLocation"
                        value={formData.workLocation}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="Office (Lucknow HQ)">Office (Lucknow HQ)</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Probation Period</label>
                      <select
                        name="probationPeriod"
                        value={formData.probationPeriod}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="Confirmed">Confirmed Direct</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: EDUCATION */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Highest Qualification *</label>
                      <select
                        name="highestQualification"
                        value={formData.highestQualification}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                        <option value="MCA / M.Tech">MCA / M.Tech</option>
                        <option value="BCA / B.Sc">BCA / B.Sc</option>
                        <option value="Diploma">Polytechnic / Diploma</option>
                        <option value="Other">Other Graduate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Course / Degree *</label>
                      <input
                        type="text"
                        name="courseName"
                        value={formData.courseName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="e.g. Computer Science"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">University / Board *</label>
                      <input
                        type="text"
                        name="universityName"
                        value={formData.universityName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="University Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">College / Institute</label>
                      <input
                        type="text"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="Institute name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year *</label>
                      <input
                        type="text"
                        name="passingYear"
                        value={formData.passingYear}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="2023"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Percentage / CGPA *</label>
                      <input
                        type="text"
                        name="percentageCGPA"
                        value={formData.percentageCGPA}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="8.4 CGPA or 82%"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Education Gap (If any)?</label>
                      <select
                        name="hasEducationGap"
                        value={formData.hasEducationGap}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="No">No Gap</option>
                        <option value="Yes">Yes (Specify Reason)</option>
                      </select>
                    </div>
                  </div>

                  {/* Documents Checklist Simulation */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                    <h4 className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
                      <MdSchool className="text-blue-600 text-base" /> Educational Marksheets Status
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>10th Marksheet</span>
                        <span className="text-emerald-600 flex items-center gap-1"><MdCheckCircle /> Ready</span>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>12th Marksheet</span>
                        <span className="text-emerald-600 flex items-center gap-1"><MdCheckCircle /> Ready</span>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Degree Certificate</span>
                        <span className="text-emerald-600 flex items-center gap-1"><MdCheckCircle /> Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: EXPERIENCE */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-500">Track Type:</span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="experienceLevel"
                        value="Fresher"
                        checked={formData.experienceLevel === 'Fresher'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Fresher Track
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="experienceLevel"
                        value="Experienced"
                        checked={formData.experienceLevel === 'Experienced'}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Experienced Track
                    </label>
                  </div>

                  {formData.experienceLevel === 'Fresher' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Internship Experience?</label>
                          <select
                            name="internshipDone"
                            value={formData.internshipDone}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Internship Company Name</label>
                          <input
                            type="text"
                            name="internshipCompany"
                            value={formData.internshipCompany}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            placeholder="e.g. Infotech Solutions"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Internship Duration</label>
                          <input
                            type="text"
                            name="internshipDuration"
                            value={formData.internshipDuration}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            placeholder="e.g. 6 Months"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Total Experience (Years)</label>
                          <input
                            type="number"
                            name="totalExpYears"
                            value={formData.totalExpYears}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Total Months</label>
                          <input
                            type="number"
                            name="totalExpMonths"
                            value={formData.totalExpMonths}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Previous CTC (₹ LPA)</label>
                          <input
                            type="text"
                            name="prevCTC"
                            value={formData.prevCTC}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            placeholder="e.g. 6.5 LPA"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Expected CTC (₹ LPA)</label>
                          <input
                            type="text"
                            name="expectedCTC"
                            value={formData.expectedCTC}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            placeholder="e.g. 8.5 LPA"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Previous Company Name</label>
                          <input
                            type="text"
                            name="prevCompany"
                            value={formData.prevCompany}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            placeholder="e.g. TechCorp India"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Previous Designation</label>
                          <input
                            type="text"
                            name="prevDesignation"
                            value={formData.prevDesignation}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">HR / Manager Contact</label>
                          <input
                            type="text"
                            name="prevManagerContact"
                            value={formData.prevManagerContact}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            placeholder="hr@prevcompany.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 6: TECHNICAL SKILLS */}
              {currentStep === 6 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Primary Technical Skills *</label>
                      <input
                        type="text"
                        name="primarySkills"
                        value={formData.primarySkills}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="React.js, Node.js, Express"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Technical Skills</label>
                      <input
                        type="text"
                        name="secondarySkills"
                        value={formData.secondarySkills}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="Flutter, MongoDB, TailwindCSS"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile URL</label>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website</label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="https://yourportfolio.dev"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: BANK ACCOUNT */}
              {currentStep === 7 && (
                <div className="space-y-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 font-medium flex items-center gap-2">
                    <MdAccountBalance className="text-base text-blue-600 shrink-0" />
                    Salary and monthly allowances will be directly credited to this account. Ensure account holder name matches your ID.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name *</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Account Number *</label>
                      <input
                        type="password"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold"
                        placeholder="•••• •••• ••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Account Number *</label>
                      <input
                        type="text"
                        name="confirmAccountNumber"
                        value={formData.confirmAccountNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold"
                        placeholder="Re-enter Account Number"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 uppercase font-mono font-bold"
                        placeholder="HDFC0001234"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name</label>
                      <input
                        type="text"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="e.g. Hazratganj Branch"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
                      <select
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="Savings">Savings Account</option>
                        <option value="Current">Current Account</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: KYC & STATUTORY */}
              {currentStep === 8 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Card Number *</label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold"
                        placeholder="12-digit Aadhaar"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">PAN Card Number *</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold uppercase"
                        placeholder="ABCDE1234F"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Passport Number (Optional)</label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="Indian Passport No."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Existing UAN (If applicable)</label>
                      <input
                        type="text"
                        name="uanNumber"
                        value={formData.uanNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold"
                        placeholder="Universal Account Number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ESIC Number (If applicable)</label>
                      <input
                        type="text"
                        name="esicNumber"
                        value={formData.esicNumber}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold"
                        placeholder="ESIC ID"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-black text-slate-900 mb-3">Statutory Nominee (For PF & Insurance)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nominee Full Name</label>
                        <input
                          type="text"
                          name="nomineeName"
                          value={formData.nomineeName}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                          placeholder="Nominee Name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                        <select
                          name="nomineeRelation"
                          value={formData.nomineeRelation}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        >
                          <option value="Parent">Parent</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nominee Contact Number</label>
                        <input
                          type="tel"
                          name="nomineeContact"
                          value={formData.nomineeContact}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                          placeholder="+91 98000 00000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 9: EMERGENCY & PREFERENCES */}
              {currentStep === 9 && (
                <div className="space-y-5">
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 font-medium flex items-center gap-2">
                    <MdPhone className="text-base text-rose-600 shrink-0" />
                    Emergency contact will be reached in case of health emergencies or immediate personal notice.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Person *</label>
                      <input
                        type="text"
                        name="emergencyName"
                        value={formData.emergencyName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Relationship *</label>
                      <input
                        type="text"
                        name="emergencyRelation"
                        value={formData.emergencyRelation}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="e.g. Father, Spouse"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Mobile Number *</label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="+91 98765 00000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
                      <input
                        type="text"
                        name="prefLanguage"
                        value={formData.prefLanguage}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="Hindi, English"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WFH Setup Available?</label>
                      <select
                        name="wfhAvailable"
                        value={formData.wfhAvailable}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                      >
                        <option value="Yes">Yes, High-Speed Broadband & Laptop</option>
                        <option value="Partial">Partial</option>
                        <option value="No">No (Requires Office Setup)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medical Instructions</label>
                      <input
                        type="text"
                        name="medicalEmergencyNote"
                        value={formData.medicalEmergencyNote}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                        placeholder="Allergies, chronic conditions"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 10: DECLARATION & CONSENT */}
              {currentStep === 10 && (
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <MdAssignmentTurnedIn className="text-blue-600 text-base" /> Mandatory Declarations & Code of Conduct
                    </h3>
                    
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          name="consentAllAccuracy"
                          checked={formData.consentAllAccuracy}
                          onChange={handleChange}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                          required
                        />
                        <span>
                          1. I confirm that all information and documents provided in this onboarding dossier are accurate and complete.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          name="consentBackgroundVerification"
                          checked={formData.consentBackgroundVerification}
                          onChange={handleChange}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>
                          2. I authorize AayupOnes to verify educational and previous employment records.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          name="consentNDA"
                          checked={formData.consentNDA}
                          onChange={handleChange}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                          required
                        />
                        <span>
                          3. I agree to abide by the Company Non-Disclosure Agreement (NDA) and Data Security policies.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employee Digital Signature (Type Full Legal Name) *
                      </label>
                      <input
                        type="text"
                        name="empSignature"
                        value={formData.empSignature}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-serif italic font-bold"
                        placeholder="e.g. Rahul Kumar"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Submission Date</label>
                      <input
                        type="text"
                        value={formData.submissionDate}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Buttons */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                >
                  <MdArrowBack /> Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
                  >
                    <MdSave className="text-sm text-blue-600" /> Save as Draft
                  </button>

                  {currentStep < 10 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                    >
                      Save & Continue <MdArrowForward />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
                    >
                      {isSubmitting ? 'Transmitting Application...' : 'Sign & Complete Application'} <MdCheckCircle />
                    </button>
                  )}
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
