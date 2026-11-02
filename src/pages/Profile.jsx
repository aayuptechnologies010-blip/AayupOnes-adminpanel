import React, { useState } from 'react';
import { 
  MdBadge, 
  MdEdit, 
  MdShield, 
  MdKey, 
  MdEmail, 
  MdPhone, 
  MdLocationPin, 
  MdCameraAlt,
  MdSave,
  MdCheckCircle
} from 'react-icons/md';
import { showSuccessToast } from '../utils/alerts';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Rahul Kumar',
    empId: 'AAYUP-DEV-0024',
    role: 'Corporate HR Administrator & Lead Developer',
    dept: 'Engineering & People Ops',
    email: 'rahul.k@aayup.com',
    phone: '+91 98765 43210',
    joined: '14 Jan 2024',
    location: 'Lucknow Headquarters, UP',
    bloodGroup: 'O+ Positive',
    emergencyContact: '+91 98111 22334 (Brother)'
  });

  const [activeTab, setActiveTab] = useState('Personal');

  const handleSave = (e) => {
    e.preventDefault();
    showSuccessToast('Administrator profile details updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Profile & Security</h1>
        <p className="text-xs text-slate-500 font-medium">Manage administrator credentials, personal details and HRMS permissions.</p>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white/20 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/20">
            RK
          </div>
          <button 
            onClick={() => showSuccessToast('Avatar upload dialog opened.')}
            className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
          >
            <MdCameraAlt className="text-sm" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold mb-1">
            <MdShield className="text-sm" /> SUPER ADMINISTRATOR
          </div>
          <h2 className="text-xl font-extrabold text-white">{profile.name}</h2>
          <p className="text-xs text-slate-300 mt-0.5">{profile.role}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <MdBadge className="text-blue-400 text-sm" /> ID: {profile.empId}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <MdLocationPin className="text-blue-400 text-sm" /> {profile.location}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <MdCheckCircle className="text-sm" /> Session Active
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['Personal', 'Security & Password', 'Permissions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Personal' && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
            Personal Contact & Official Records
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Corporate Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Department</label>
              <input
                type="text"
                value={profile.dept}
                onChange={(e) => setProfile({ ...profile, dept: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={profile.emergencyContact}
                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <MdSave className="text-base" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'Security & Password' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
            Account Security & Authentication Keys
          </h3>

          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Corporate Password</label>
              <input
                type="password"
                placeholder="Enter at least 8 characters"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => showSuccessToast('Password successfully updated!')}
              className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Permissions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
            Assigned Role Capabilities (RBAC)
          </h3>
          <div className="space-y-2">
            {[
              { role: 'Workforce Registry Management', desc: 'Can onboard, edit and archive employee contracts' },
              { role: 'Payroll Disbursal Execution', desc: 'Can approve monthly bank advice and release payslips' },
              { role: 'Attendance & Biometric Sync', desc: 'Can regularize punches and modify geo-fencing radius' },
              { role: 'Compliance & Document Publishing', desc: 'Can publish legal policies and POSH frameworks' },
            ].map((p, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">{p.role}</div>
                  <div className="text-[11px] text-slate-500">{p.desc}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

