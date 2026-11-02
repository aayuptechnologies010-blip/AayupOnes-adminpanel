import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { 
  MdPeople, 
  MdCheckCircle, 
  MdBeachAccess, 
  MdPendingActions, 
  MdArrowUpward,
  MdPayments,
  MdTrendingUp
} from 'react-icons/md';
import { initialApprovals } from '../data/mockData';

const Dashboard = () => {
  // 1. Highcharts: Attendance & Headcount Trends
  const attendanceTrendOptions = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 280,
      style: {
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }
    },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      labels: {
        style: { color: '#64748b', fontWeight: '600', fontSize: '11px' }
      },
      gridLineColor: '#f1f5f9'
    },
    yAxis: {
      title: { text: null },
      min: 20,
      max: 45,
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
        fillOpacity: 0.15,
        lineWidth: 3,
        marker: { radius: 4 }
      }
    },
    series: [
      {
        name: 'Present In-Office',
        data: [36, 38, 40, 39, 38, 35],
        color: '#0066d6'
      },
      {
        name: 'Work From Home',
        data: [4, 3, 2, 3, 4, 2],
        color: '#06b6d4'
      }
    ]
  };

  // 2. Highcharts: Department Distribution Pie Chart
  const departmentPieOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 280,
      style: {
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }
    },
    title: { text: null },
    credits: { enabled: false },
    tooltip: {
      pointFormat: '<b>{point.y}</b> employees ({point.percentage:.1f}%)',
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
        data: [
          { name: 'Engineering', y: 24, color: '#0066d6' },
          { name: 'Product Design', y: 6, color: '#ec4899' },
          { name: 'QA & Testing', y: 5, color: '#f59e0b' },
          { name: 'People & HR', y: 4, color: '#10b981' },
          { name: 'Marketing', y: 3, color: '#8b5cf6' }
        ]
      }
    ]
  };

  const kpis = [
    {
      title: 'Total Headcount',
      value: '42',
      change: '+3 new hires',
      icon: MdPeople,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      title: 'Present Today',
      value: '38',
      change: '90.4% turnout',
      icon: MdCheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      title: 'On Leave / WFH',
      value: '4',
      change: '2 WFH • 2 Leave',
      icon: MdBeachAccess,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      title: 'Pending Approvals',
      value: '2',
      change: 'Action required',
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
            AAYUPONES ENTERPRISE WORKSPACE
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Good Day, Aayup HR Admin 👋</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            You have <strong className="text-white">2 pending approvals</strong> and upcoming monthly payroll disbursal scheduled for Oct 31.
          </p>
        </div>
        <div className="z-10 flex gap-3">
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

      {/* KPI Cards */}
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
                  Live
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</div>
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
        {/* Attendance Trends Highchart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Attendance & Shift Analysis</h2>
              <p className="text-xs text-slate-500">Weekly in-office vs remote distribution</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Live Week Tracker
            </span>
          </div>
          <HighchartsReact highcharts={Highcharts} options={attendanceTrendOptions} />
        </div>

        {/* Department Pie Highchart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Department Diversity</h2>
              <p className="text-xs text-slate-500">Distribution by teams</p>
            </div>
          </div>
          <HighchartsReact highcharts={Highcharts} options={departmentPieOptions} />
        </div>
      </div>

      {/* Bottom Grid: Recent Pending Approvals Quick Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Immediate Action Required</h2>
            <p className="text-xs text-slate-500">Pending leave and regularization approvals</p>
          </div>
          <a href="/approvals" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All Approvals →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
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
              {initialApprovals.slice(0, 3).map((item) => (
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
                        item.status === 'Pending'
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

