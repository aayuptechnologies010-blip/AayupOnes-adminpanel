import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { 
  MdPeople, 
  MdCheckCircle, 
  MdBeachAccess, 
  MdPendingActions, 
  MdArrowUpward,
  MdPayments,
  MdRefresh,
  MdBolt,
  MdAccessTime,
  MdOutlineWbSunny,
  MdNightlightRound
} from 'react-icons/md';
import apiClient from '../services/api';
import { showSuccessToast } from '../utils/alerts';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeShiftView, setActiveShiftView] = useState('all'); // 'all' | 'shifts'
  const [statsData, setStatsData] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('aayup_admin_user') || '{"name":"Aayup Admin"}');
  });

  // Fast fetch dashboard analytics from database API
  const fetchDashboardMetrics = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await apiClient.getDashboardStats();

      if (res && res.success) {
        setStatsData(res);
        if (showToast) showSuccessToast(`Dashboard analytics refreshed in ${res.executionTimeMs}ms!`);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err.message);
      // Empty dynamic state
      setStatsData({
        metrics: {
          totalHeadcount: 0,
          presentToday: 0,
          turnoutPercentage: '0%',
          onLeaveOrWfh: 0,
          pendingApprovals: 0
        },
        charts: {
          attendanceAndShift: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            inOffice: [0, 0, 0, 0, 0, 0],
            wfh: [0, 0, 0, 0, 0, 0],
            shiftBreakdown: {
              generalShift: 0,
              operational247: 0,
              flexibleRemote: 0
            }
          },
          departmentDistribution: []
        },
        recentApprovals: []
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  // 1. Dynamic Highcharts: Attendance & Shift Analysis
  const attendanceData = statsData?.charts?.attendanceAndShift || statsData?.charts?.weeklyAttendance;
  const categories = attendanceData?.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const inOfficeSeries = attendanceData?.inOffice || [36, 38, 40, 39, 38, 35];
  const wfhSeries = attendanceData?.wfh || [4, 3, 2, 3, 4, 2];

  const attendanceTrendOptions = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 290,
      style: { fontFamily: "'Plus Jakarta Sans', sans-serif" }
    },
    accessibility: { enabled: false },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: categories,
      labels: {
        style: { color: '#64748b', fontWeight: '600', fontSize: '11px' }
      },
      gridLineColor: '#f1f5f9'
    },
    yAxis: {
      title: { text: null },
      min: 0,
      labels: {
        style: { color: '#64748b', fontSize: '11px' }
      },
      gridLineColor: '#f1f5f9'
    },
    tooltip: {
      shared: true,
      backgroundColor: '#0f172a',
      borderRadius: 12,
      style: { color: '#ffffff' }
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.16,
        lineWidth: 3,
        marker: { radius: 4 }
      }
    },
    series: [
      {
        name: 'In-Office (General Shift)',
        data: inOfficeSeries,
        color: '#0066d6'
      },
      {
        name: 'Work From Home / Remote',
        data: wfhSeries,
        color: '#06b6d4'
      }
    ]
  };

  // 2. Highcharts: Department Distribution Pie Chart
  const departmentPieOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 290,
      style: { fontFamily: "'Plus Jakarta Sans', sans-serif" }
    },
    accessibility: { enabled: false },
    title: { text: null },
    credits: { enabled: false },
    tooltip: {
      pointFormat: '<b>{point.y}</b> members ({point.percentage:.1f}%)',
      backgroundColor: '#0f172a',
      borderRadius: 12,
      style: { color: '#ffffff' }
    },
    plotOptions: {
      pie: {
        innerSize: '65%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: { enabled: false },
        showInLegend: true
      }
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      itemStyle: { color: '#475569', fontSize: '12px', fontWeight: '600' }
    },
    series: [
      {
        name: 'Headcount',
        colorByPoint: true,
        data: statsData?.charts?.departmentDistribution || [
          { name: 'Core Engineering', y: 24, color: '#0066d6' },
          { name: 'Product Design', y: 6, color: '#ec4899' },
          { name: 'QA & Testing', y: 5, color: '#f59e0b' },
          { name: 'People & HR', y: 4, color: '#10b981' },
          { name: 'Marketing', y: 3, color: '#8b5cf6' }
        ]
      }
    ]
  };

  const shiftInfo = statsData?.charts?.attendanceAndShift?.shiftBreakdown || {
    generalShift: 27,
    operational247: 11,
    flexibleRemote: 4
  };

  const kpis = [
    {
      title: 'Total Headcount',
      value: statsData?.metrics?.totalHeadcount ?? '42',
      change: 'Active Registry',
      icon: MdPeople,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      title: 'Present Today',
      value: statsData?.metrics?.presentToday ?? '38',
      change: `${statsData?.metrics?.turnoutPercentage || '90.5%'} Turnout`,
      icon: MdCheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      title: 'On Leave / WFH',
      value: statsData?.metrics?.onLeaveOrWfh ?? '4',
      change: 'Planned Absence',
      icon: MdBeachAccess,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      title: 'Pending Approvals',
      value: statsData?.metrics?.pendingApprovals ?? '2',
      change: 'Action Required',
      icon: MdPendingActions,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      border: 'border-indigo-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-2 tracking-wide">
            <MdBolt className="text-amber-400" />
            <span>LIVE MONGODB SYNC ACTIVE</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Good Day, {currentUser.name || 'Admin'} 👋
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            You have <strong className="text-white">{statsData?.metrics?.pendingApprovals || 2} pending approvals</strong> waiting for verification in your administrative inbox.
          </p>
        </div>
        <div className="z-10 flex items-center gap-3">
          <button
            onClick={() => fetchDashboardMetrics(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/20 disabled:opacity-50"
            title="Refresh database metrics"
          >
            <MdRefresh className={`text-base ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <a
            href="/payroll"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <MdPayments className="text-base" />
            <span>Process Payroll</span>
          </a>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-white p-5 rounded-2xl border ${kpi.border} shadow-sm hover:shadow-md transition duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${kpi.bgColor} ${kpi.color}`}>
                  <Icon className="text-2xl" />
                </div>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <MdArrowUpward className="text-emerald-500" />
                  Live API
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded"></span>
                  ) : (
                    kpi.value
                  )}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-0.5">{kpi.title}</div>
                <div className="text-xs font-semibold text-slate-600 mt-2 bg-slate-50 py-1 px-2 rounded-lg inline-block">
                  {kpi.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Highcharts Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Attendance & Shift Analysis Highchart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Attendance & Shift Analysis</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Last 6 active days in-office vs remote shift distribution from MongoDB
                </p>
              </div>

              {/* Dynamic Live Shift Badges (Strict Single Line) */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 whitespace-nowrap shrink-0">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                  <MdOutlineWbSunny className="text-amber-500 text-sm shrink-0" />
                  <span>General: {shiftInfo.generalShift}</span>
                </span>
                <span className="text-[11px] font-bold text-slate-700 pl-2.5 border-l border-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                  <MdAccessTime className="text-blue-500 text-sm shrink-0" />
                  <span>24/7 Duty: {shiftInfo.operational247}</span>
                </span>
                <span className="text-[11px] font-bold text-slate-700 pl-2.5 border-l border-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                  <MdNightlightRound className="text-indigo-500 text-sm shrink-0" />
                  <span>WFH: {shiftInfo.flexibleRemote}</span>
                </span>
              </div>
            </div>

            <HighchartsReact highcharts={Highcharts} options={attendanceTrendOptions} />
          </div>

          {/* Bottom Live Shift Analytics Summary Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-blue-50/50 border border-blue-100/50">
              <div className="text-[11px] font-semibold text-slate-500">Average Turnout</div>
              <div className="text-sm font-black text-blue-600">{statsData?.metrics?.turnoutPercentage || '91.2%'}</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="text-[11px] font-semibold text-slate-500">Peak Presence</div>
              <div className="text-sm font-black text-emerald-600">{Math.max(...inOfficeSeries)} Present</div>
            </div>
            <div className="p-2 rounded-xl bg-cyan-50/50 border border-cyan-100/50">
              <div className="text-[11px] font-semibold text-slate-500">Active WFH</div>
              <div className="text-sm font-black text-cyan-600">{wfhSeries[wfhSeries.length - 1]} Remote</div>
            </div>
          </div>
        </div>

        {/* Department Pie Highchart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Department Diversity</h2>
                <p className="text-xs text-slate-500">Live employee team breakdown</p>
              </div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={departmentPieOptions} />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Primary Squad: Core Engineering</span>
            <span className="font-bold text-slate-800">{statsData?.metrics?.totalHeadcount || 42} Registered</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Pending Approvals Quick Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Immediate Action Required</h2>
            <p className="text-xs text-slate-500">Live pending leave requests from MongoDB</p>
          </div>
          <a href="/approvals" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All Approvals →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Employee</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(statsData?.recentApprovals || []).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                      {item.avatar}
                    </div>
                    <div>
                      <div>{item.emp}</div>
                      <div className="text-xs text-slate-400 font-normal">{item.role}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-medium text-slate-700">{item.dates}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 max-w-xs truncate">{item.reason}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.status === 'PENDING' || item.status === 'Pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
