import React, { useState } from 'react';
import { 
  MdFolderCopy, 
  MdUploadFile, 
  MdDownload, 
  MdSearch, 
  MdFilterList,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdVerifiedUser,
  MdFileDownloadDone,
  MdVisibility,
  MdDeleteOutline,
  MdCampaign,
  MdCelebration,
  MdSend,
  MdEmojiEvents,
  MdThumbUp,
  MdComment,
  MdNotificationsActive,
  MdAddCircleOutline
} from 'react-icons/md';
import { showSuccessToast, showConfirmDialog } from '../utils/alerts';
import Swal from 'sweetalert2';

const Documents = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'docs' | 'kudos'

  // Company Social Wall & Announcements Feed
  const [posts, setPosts] = useState([
    {
      id: 'POST-01',
      author: 'CEO Office & HR Leadership',
      authorAvatar: 'HQ',
      time: 'Today, 10:30 AM',
      title: 'Diwali 2026 Festive Holidays & Annual Bonus Disbursal 🎉',
      content: 'Wishing all AayupOnes family members a joyous festive season! The office will observe paid holidays from 31 Oct to 03 Nov. Annual Diwali bonuses have been queued with October payroll.',
      badge: 'Official HR Circular',
      likes: 38,
      commentsCount: 14,
      priority: 'High',
      likedByMe: true
    },
    {
      id: 'POST-02',
      author: 'Vikram Singh (Head of Technology)',
      authorAvatar: 'VS',
      time: 'Yesterday',
      title: 'Kudos to Rahul Kumar for Zero-Downtime Mobile Gateway Release! 🏆',
      content: 'Huge shoutout to Rahul for working relentlessly on the Flutter biometric and geofencing architecture. The response time has dropped by 45%!',
      badge: 'Peer Recognition (Kudos)',
      likes: 29,
      commentsCount: 8,
      priority: 'Kudos',
      likedByMe: true
    },
    {
      id: 'POST-03',
      author: 'People & Culture Desk',
      authorAvatar: 'PC',
      time: '2 days ago',
      title: 'Welcome 5 New Core Engineers to AayupOnes! 🚀',
      content: 'Please join us in giving a warm welcome to our newly onboarded team members in Engineering and Design. Drop your wishes below!',
      badge: 'New Joinee Announcement',
      likes: 42,
      commentsCount: 19,
      priority: 'Normal',
      likedByMe: false
    }
  ]);

  // Corporate Policies
  const [docs, setDocs] = useState([
    { id: 'DOC-01', name: 'Aayup Technologies Employee Code of Conduct 2026.pdf', size: '2.4 MB', category: 'HR Policy', date: '01 Jan 2026', downloads: 42, author: 'Pooja Verma (HR)' },
    { id: 'DOC-02', name: 'POSH Policy & Internal Complaints Committee Redressal.pdf', size: '1.8 MB', category: 'Compliance', date: '15 Jan 2026', downloads: 38, author: 'Legal Counsel' },
    { id: 'DOC-03', name: 'Leave Policy & Attendance Regularization Rules v3.pdf', size: '980 KB', category: 'Operations', date: '10 Feb 2026', downloads: 40, author: 'HR Ops' },
    { id: 'DOC-04', name: 'Non-Disclosure Agreement & Proprietary Information Terms.docx', size: '640 KB', category: 'Legal', date: '01 Mar 2026', downloads: 35, author: 'Legal Counsel' },
    { id: 'DOC-05', name: 'Annual Appraisal & Performance Band Framework 2026.pdf', size: '3.1 MB', category: 'Compensation', date: '01 Oct 2026', downloads: 29, author: 'Leadership Office' },
    { id: 'DOC-06', name: 'Health Insurance & Mediclaim TPA Cashless Network.pdf', size: '1.2 MB', category: 'Benefits', date: '12 Sep 2026', downloads: 31, author: 'People Team' },
    { id: 'DOC-07', name: 'Remote Work From Home (WFH) InfoSec Protocol.pdf', size: '850 KB', category: 'Security', date: '18 Aug 2026', downloads: 42, author: 'IT Lead' }
  ]);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleCreateAnnouncement = () => {
    Swal.fire({
      title: 'Broadcast Announcement to Mobile App',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Announcement Title (e.g. Townhall Meeting)">
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Write company circular or announcement details..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0066d6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Publish & Push to App',
      preConfirm: () => {
        const title = document.getElementById('swal-title').value;
        const desc = document.getElementById('swal-desc').value;
        if (!title || !desc) {
          Swal.showValidationMessage('Please provide title and content!');
        }
        return { title, desc };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newPost = {
          id: `POST-0${posts.length + 1}`,
          author: 'HR Operations',
          authorAvatar: 'HR',
          time: 'Just now',
          title: result.value.title,
          content: result.value.desc,
          badge: 'Broadcast Notice',
          likes: 1,
          commentsCount: 0,
          priority: 'High',
          likedByMe: true
        };
        setPosts([newPost, ...posts]);
        Swal.fire({
          icon: 'success',
          title: 'Published!',
          text: 'Announcement broadcasted to all employees on Mobile App & Web.',
          timer: 1800,
          showConfirmButton: false
        });
      }
    });
  };

  const handleGiveKudos = () => {
    Swal.fire({
      title: 'Send Public Peer Recognition 🏆',
      html: `
        <select id="kudos-emp" class="swal2-input">
          <option value="Rahul Kumar">Rahul Kumar (Senior React Dev)</option>
          <option value="Sneha Tiwari">Sneha Tiwari (Lead Product Designer)</option>
          <option value="Amit Patel">Amit Patel (QA Lead)</option>
          <option value="Vikram Singh">Vikram Singh (Backend Architect)</option>
        </select>
        <input id="kudos-badge" class="swal2-input" placeholder="Badge (e.g. Problem Solver, Team Player)">
        <textarea id="kudos-reason" class="swal2-textarea" placeholder="Appreciation message..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Post Kudos',
      preConfirm: () => {
        const emp = document.getElementById('kudos-emp').value;
        const badge = document.getElementById('kudos-badge').value || 'Excellence Award';
        const reason = document.getElementById('kudos-reason').value;
        if (!reason) {
          Swal.showValidationMessage('Please write a message of appreciation!');
        }
        return { emp, badge, reason };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newKudosPost = {
          id: `KUDOS-0${posts.length + 1}`,
          author: 'HR & Team Lead',
          authorAvatar: 'TL',
          time: 'Just now',
          title: `Kudos to ${result.value.emp}! 🌟`,
          content: result.value.reason,
          badge: result.value.badge,
          likes: 12,
          commentsCount: 2,
          priority: 'Kudos',
          likedByMe: true
        };
        setPosts([newKudosPost, ...posts]);
        showSuccessToast(`Kudos posted for ${result.value.emp}!`);
      }
    });
  };

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likedByMe: !p.likedByMe,
          likes: p.likedByMe ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const filteredDocs = docs.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredDocs.length / pageSize) || 1;
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Company Social Wall & Policies</h1>
          <p className="text-xs text-slate-500 font-medium">Broadcast corporate announcements, share peer recognition kudos, and manage company policies.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGiveKudos}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <MdEmojiEvents className="text-base text-emerald-600" />
            <span>Give Kudos 🏆</span>
          </button>
          <button
            onClick={handleCreateAnnouncement}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <MdCampaign className="text-base" />
            <span>Post Announcement</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Social Feed vs Corporate Policies */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'feed'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdCampaign className="text-base" /> Company Feed & Kudos Wall ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'docs'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MdFolderCopy className="text-base" /> Corporate Policy Repository ({docs.length})
        </button>
      </div>

      {/* TAB 1: SOCIAL WALL & ANNOUNCEMENTS */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-sm flex items-center justify-center">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{post.author}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{post.time} &bull; Synced with Mobile App</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    post.priority === 'Kudos' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {post.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1">{post.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
                </div>

                {/* Social Interaction Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition ${
                        post.likedByMe ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MdThumbUp className="text-base" />
                      <span>{post.likes} Cheers</span>
                    </button>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MdComment className="text-base" /> {post.commentsCount} Comments
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Active on App Feed
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar: Birthday / Work Anniversary Widget */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                <MdCelebration className="text-rose-500 text-lg" /> Today's Celebrations
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Rahul Kumar</span>
                    <span className="text-[10px] text-slate-500">Birthday Today 🎂</span>
                  </div>
                  <button 
                    onClick={() => showSuccessToast('Birthday wish sent to Rahul on Mobile App!')}
                    className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 font-bold text-[11px] rounded-lg shadow-sm"
                  >
                    Wish 🎈
                  </button>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Vikram Singh</span>
                    <span className="text-[10px] text-slate-500">3 Years Work Anniversary 🏆</span>
                  </div>
                  <button 
                    onClick={() => showSuccessToast('Congratulated Vikram!')}
                    className="px-2.5 py-1 bg-white border border-blue-200 text-blue-600 font-bold text-[11px] rounded-lg shadow-sm"
                  >
                    Kudos ⭐
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CORPORATE POLICIES TABLE */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Doc ID</th>
                  <th className="px-6 py-3.5">Policy Document</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5">Published Date</th>
                  <th className="px-6 py-3.5">Read Acknowledged</th>
                  <th className="px-6 py-3.5 sticky right-0 bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{doc.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{doc.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">{doc.size}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.date}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{doc.downloads} of 42 Staff</td>
                    <td className="px-6 py-4 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">
                      <button
                        onClick={() => showSuccessToast(`Downloading ${doc.name}`)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                      >
                        <MdDownload /> Download
                      </button>
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

export default Documents;
