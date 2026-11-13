import React, { useState, useEffect, useCallback } from 'react';
import { 
  MdHeadsetMic, 
  MdSearch, 
  MdFilterList, 
  MdCheckCircle, 
  MdPendingActions,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdErrorOutline,
  MdVisibility,
  MdReply,
  MdLaptopMac,
  MdAssignmentInd,
  MdCheck,
  MdClose,
  MdTune,
  MdDevices,
  MdRefresh
} from 'react-icons/md';
import { showSuccessToast, showErrorToast } from '../utils/alerts';
import Swal from 'sweetalert2';
import apiClient from '../services/api';

const Helpdesk = () => {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'assets'
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const pageSize = 6;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getHelpdeskTickets();
      if (res && res.success) {
        setTickets(res.data || []);
      }
    } catch (e) {
      console.error(e);
      showErrorToast('Failed to load helpdesk tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // IT Assets Registry
  const [assets, setAssets] = useState([]);

  const handleResolveTicket = (ticket) => {
    Swal.fire({
      title: 'Resolve & Close Ticket?',
      input: 'textarea',
      inputLabel: 'Resolution Summary & Remarks',
      inputPlaceholder: 'e.g. Hardware replacement issued / Query addressed with employee.',
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Resolve Ticket',
      inputValidator: (value) => {
        if (!value) return 'Please mention a resolution remark!';
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.updateTicketStatus(ticket.id, {
            status: 'RESOLVED',
            remarks: result.value
          });
          showSuccessToast(`Ticket ${ticket.ticketId || ticket.id} marked as Resolved!`);
          fetchTickets();
        } catch (e) {
          showErrorToast('Failed to update ticket status.');
        }
      }
    });
  };

  const filteredTickets = tickets.filter((t) => {
    const s = search.toLowerCase();
    const matchesSearch = 
      (t.emp || '').toLowerCase().includes(s) ||
      (t.subject || '').toLowerCase().includes(s) ||
      (t.ticketId || t.id || '').toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">IT Helpdesk & Asset Management</h1>
          <p className="text-xs text-slate-500 font-medium">Manage support tickets raised from Mobile App & track allocated company hardware.</p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{tickets.length} Tickets</div>
            <div className="text-[11px] text-slate-500 font-medium">All Employee Inquiries</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MdHeadsetMic className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open / Pending</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length} Active</div>
            <div className="text-[11px] text-slate-500 font-medium">In Queue / Investigation</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <MdPendingActions className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{tickets.filter(t => t.status === 'Resolved').length} Solved</div>
            <div className="text-[11px] text-slate-500 font-medium">Average SLA: 4.2 Hours</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdCheckCircle className="text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocated Assets</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{assets.length} Devices</div>
            <div className="text-[11px] text-slate-500 font-medium">Laptops, Displays & Badges</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <MdLaptopMac className="text-xl" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Helpdesk vs Asset Inventory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'tickets'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdHeadsetMic className="text-base" /> Employee Tickets Feed ({tickets.filter(t => t.status !== 'Resolved').length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'assets'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdDevices className="text-base" /> Company Assets Inventory ({assets.length})
        </button>
      </div>

      {/* TAB 1: TICKETS FEED */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket by subject, employee..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <MdFilterList className="text-slate-700 text-base" /> Status:
              </span>
              {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Ticket ID</th>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Priority</th>
                    <th className="px-6 py-3.5">Assigned To</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 sticky right-0 bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                        Loading helpdesk tickets from database...
                      </td>
                    </tr>
                  ) : paginatedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No support tickets match current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{ticket.ticketId || ticket.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                            {ticket.avatar || 'EM'}
                          </span>
                          <div>
                            <div>{ticket.emp}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{ticket.dept}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{ticket.category}</td>
                        <td className="px-6 py-4 text-slate-700 max-w-xs truncate" title={ticket.subject}>
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ticket.priority === 'Urgent' || ticket.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            ticket.priority === 'High' || ticket.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{ticket.assignedTo}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              ticket.status === 'Resolved' || ticket.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ticket.status === 'In Progress' || ticket.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center gap-1.5">
                            {ticket.status !== 'Resolved' && ticket.status !== 'RESOLVED' ? (
                              <button
                                onClick={() => handleResolveTicket(ticket)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                              >
                                <MdCheck /> Resolve
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                              >
                                <MdVisibility /> View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY ASSETS INVENTORY */}
      {activeTab === 'assets' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Assigned Company Hardware Registry</h3>
              <p className="text-xs text-slate-500">Track laptops, displays, and gear issued to employees. Visible on their mobile profile.</p>
            </div>
          </div>

          <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Asset Tag</th>
                  <th className="px-6 py-3.5">Allocated Employee</th>
                  <th className="px-6 py-3.5">Device Type</th>
                  <th className="px-6 py-3.5">Brand & Model Specifications</th>
                  <th className="px-6 py-3.5">Serial Number</th>
                  <th className="px-6 py-3.5">Issued Date</th>
                  <th className="px-6 py-3.5">Hardware Health</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((ast) => (
                  <tr key={ast.assetTag} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{ast.assetTag}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{ast.allocatedTo}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">{ast.empId}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{ast.type}</td>
                    <td className="px-6 py-4 text-slate-700">{ast.model}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 font-medium">{ast.serial}</td>
                    <td className="px-6 py-4 text-slate-600">{ast.issuedDate}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ast.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {ast.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helpdesk;
