import React from 'react';
import { 
  MdSearch, 
  MdNotificationsNone, 
  MdHelpOutline, 
  MdLocationOn, 
  MdOutlineCalendarToday 
} from 'react-icons/md';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Global Quick Search */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search employees, policies, payroll..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Right Tools & Location Badge */}
      <div className="flex items-center gap-4">
        {/* Office Location */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
          <MdLocationOn className="text-blue-600 text-base" />
          <span>Lucknow HQ</span>
        </div>

        {/* Date */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
          <MdOutlineCalendarToday className="text-slate-500 text-sm" />
          <span>{currentDate}</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <MdNotificationsNone className="text-2xl" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Help button */}
        <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <MdHelpOutline className="text-2xl" />
        </button>

        {/* Live Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            A
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-700">Aayup Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

