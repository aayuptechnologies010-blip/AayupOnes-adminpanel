import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdPeople, 
  MdAssignmentTurnedIn, 
  MdAccessTime, 
  MdPayments, 
  MdReceiptLong,
  MdCurrencyRupee,
  MdFolderCopy,
  MdHeadsetMic,
  MdSettings,
  MdPerson,
  MdLogout,
  MdShield
} from 'react-icons/md';
import { showConfirmDialog, showSuccessToast } from '../utils/alerts';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuSections = [
    {
      heading: 'CORE WORKSPACE',
      items: [
        { name: 'Dashboard', path: '/', icon: MdDashboard },
        { name: 'Employees Registry', path: '/employees', icon: MdPeople, badge: '42' },
        { name: 'Approvals Inbox', path: '/approvals', icon: MdAssignmentTurnedIn, badge: '2', badgeColor: 'bg-amber-500' },
        { name: 'Attendance & Logs', path: '/attendance', icon: MdAccessTime },
      ]
    },
    {
      heading: 'PAYROLL & FINANCE',
      items: [
        { name: 'Payroll Processing', path: '/payroll', icon: MdPayments },
        { name: 'Salary Payslips', path: '/payslips', icon: MdReceiptLong },
        { name: 'Reimbursements', path: '/reimbursements', icon: MdCurrencyRupee, badge: '2', badgeColor: 'bg-blue-500' },
      ]
    },
    {
      heading: 'ENTERPRISE DESK',
      items: [
        { name: 'Documents & Policies', path: '/documents', icon: MdFolderCopy },
        { name: 'Internal Helpdesk', path: '/helpdesk', icon: MdHeadsetMic, badge: '3', badgeColor: 'bg-rose-500' },
        { name: 'Admin Profile', path: '/profile', icon: MdPerson },
        { name: 'System Settings', path: '/settings', icon: MdSettings },
      ]
    }
  ];

  const handleLogout = async () => {
    const res = await showConfirmDialog({
      title: 'Sign Out Session?',
      text: 'Are you sure you want to exit your administrative HRMS session?',
      confirmButtonText: 'Yes, Sign Out'
    });

    if (res.isConfirmed) {
      localStorage.removeItem('aayup_admin_token');
      localStorage.removeItem('aayup_admin_user');
      showSuccessToast('Signed out successfully.');
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-800 shrink-0 sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg">
          A
        </div>
        <div>
          <div className="font-black text-base tracking-tight flex items-center gap-1.5">
            <span>Aayup</span>
            <span className="text-blue-400">Ones</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-500/30">PORTAL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Enterprise HRMS Admin</div>
        </div>
      </div>

      {/* Navigation List - Fixed with smooth independent scroll */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-3 pb-2 text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
              {section.heading}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-lg" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${
                          item.badgeColor || 'bg-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile & Dedicated Logout Action Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0 space-y-2">
        {/* Clickable Profile Card */}
        <NavLink
          to="/profile"
          className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-850 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              RK
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate text-slate-200">Rahul Kumar</div>
              <div className="text-[10.5px] text-slate-400 truncate">HR Administrator</div>
            </div>
          </div>
          <MdShield className="text-blue-400 text-sm" />
        </NavLink>

        {/* Clear Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold border border-red-500/20 transition"
        >
          <MdLogout className="text-base" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
