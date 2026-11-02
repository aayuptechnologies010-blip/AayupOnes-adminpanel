import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdLockOutline, 
  MdBadge, 
  MdVisibility, 
  MdVisibilityOff, 
  MdArrowForward,
  MdFingerprint,
  MdShield,
  MdCheckCircle,
  MdPeople,
  MdPayments,
  MdQueryStats,
  MdAccessTime
} from 'react-icons/md';
import { showSuccessToast, showErrorToast } from '../utils/alerts';

const Login = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('AAYUP-DEV-0024');
  const [password, setPassword] = useState('temp@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!empId || !password) {
      showErrorToast('Please enter both Employee ID and password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('aayup_admin_token', 'mock_secure_token_123');
      localStorage.setItem('aayup_admin_user', JSON.stringify({
        name: 'Rahul Kumar',
        empId: empId,
        role: 'Corporate HR Administrator',
        email: 'rahul.k@aayup.com'
      }));
      showSuccessToast('Signed in successfully! Welcome to AayupOnes Admin');
      navigate('/');
    }, 800);
  };

  const handleBiometricSimulate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('aayup_admin_token', 'mock_secure_biometric_token');
      localStorage.setItem('aayup_admin_user', JSON.stringify({
        name: 'Rahul Kumar',
        empId: 'AAYUP-DEV-0024',
        role: 'Corporate HR Administrator',
        email: 'rahul.k@aayup.com'
      }));
      showSuccessToast('Biometric verified! Session active.');
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorative Mesh Blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Brand Showcase Hero Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 lg:p-16 relative z-10 border-r border-slate-800/60 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-900/60 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/20 text-white font-black text-2xl border border-white/20">
            A
          </div>
          <div>
            <div className="font-black text-xl text-white tracking-tight flex items-center gap-2">
              <span>Aayup</span>
              <span className="text-blue-500">Ones</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">ENTERPRISE</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Workforce & Human Resource System</div>
          </div>
        </div>

        {/* Hero Pitch & Live Highlights */}
        <div className="space-y-8 my-auto max-w-lg">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold mb-4 tracking-wide">
              AUTHORIZED PERSONNEL PORTAL
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Manage your modern workforce with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">precision & speed.</span>
            </h1>
            <p className="text-sm text-slate-300 mt-4 leading-relaxed font-normal">
              Unified administrative portal for real-time attendance verification, multi-tier payroll disbursements, and employee self-service management.
            </p>
          </div>

          {/* Quick Stats Showcase */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <MdPeople className="text-lg" />
                <span className="text-xs font-bold">Workforce Registry</span>
              </div>
              <div className="text-xl font-black text-white">42 Active Employees</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Lucknow Technology HQ</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <MdPayments className="text-lg" />
                <span className="text-xs font-bold">Payroll Accuracy</span>
              </div>
              <div className="text-xl font-black text-white">100% Statutory</div>
              <div className="text-[11px] text-slate-400 mt-0.5">EPF, ESIC & TDS auto-billed</div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center gap-3 text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <MdShield className="text-emerald-400 text-xl shrink-0" />
          <span>Aayup Technologies Private Limited • Lucknow Corporate Office</span>
        </div>
      </div>

      {/* Right Login Action Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center shadow-xl shadow-blue-600/30 text-white font-black text-2xl mb-3 border border-white/20">
              A
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>Aayup</span>
              <span className="text-blue-500">Ones</span>
            </h2>
            <div className="text-xs text-slate-400">Enterprise HRMS Admin Console</div>
          </div>

          {/* Elevated Floating Glassmorphism Form Card */}
          <div className="bg-slate-900/90 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-slate-800/90 shadow-2xl relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"></div>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Admin Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Sign in with your corporate employee ID and password assigned by HR.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Employee ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Employee ID / Email</label>
                <div className="relative">
                  <MdBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type="text"
                    required
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    placeholder="e.g. AAYUP-DEV-0024"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:bg-slate-800 text-white text-sm rounded-xl focus:outline-none transition font-medium placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <MdLockOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter corporate password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:bg-slate-800 text-white text-sm rounded-xl focus:outline-none transition font-medium placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => showSuccessToast('Contact HR Security Officer (hr@aayup.com) for password reset token')}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Trouble logging in?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <MdArrowForward className="text-lg" />
                  </>
                )}
              </button>

              {/* Quick Biometric Simulation */}
              <button
                type="button"
                onClick={handleBiometricSimulate}
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <MdFingerprint className="text-lg text-blue-400" />
                <span>Quick Sign In with Biometrics</span>
              </button>
            </form>

            {/* Security Footnote */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-400">
              <MdShield className="text-emerald-400 text-lg shrink-0" />
              <span>256-bit encrypted corporate network. Authorized personnel only.</span>
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-slate-500">
            Aayup Technologies • Lucknow Office • v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
