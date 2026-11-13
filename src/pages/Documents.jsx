import React, { useState, useEffect, useCallback } from 'react';
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
  MdAddCircleOutline,
  MdRefresh
} from 'react-icons/md';
import { showSuccessToast, showErrorToast } from '../utils/alerts';
import Swal from 'sweetalert2';
import apiClient from '../services/api';

const Documents = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'docs' | 'kudos'
  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Fetch Live Corporate Policies from MongoDB
  const fetchPolicies = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await apiClient.getDocumentsList();
      if (res && res.success) {
        setDocs(res.data || []);
      }
    } catch (e) {
      console.error(e);
      showErrorToast('Failed to load corporate policy repository.');
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // Fetch Live Social Wall Posts from MongoDB
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await apiClient.getPosts();
      if (res && res.success) {
        setPosts(res.data || []);
      }
    } catch (e) {
      console.error(e);
      showErrorToast('Failed to load company announcements.');
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
    fetchPosts();
  }, [fetchPolicies, fetchPosts]);

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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiClient.createPost({
            title: result.value.title,
            content: result.value.desc,
            badge: 'Official HR Circular',
            priority: 'High'
          });
          if (res && res.success) {
            setPosts(prev => [res.data, ...prev]);
            Swal.fire({
              icon: 'success',
              title: 'Published!',
              text: 'Announcement broadcasted to all employees on Mobile App & Web.',
              timer: 1800,
              showConfirmButton: false
            });
          }
        } catch (err) {
          console.error(err);
          showErrorToast('Failed to post announcement.');
        }
      }
    });
  };

  const handleGiveKudos = async () => {
    let empOptions = '';
    try {
      const res = await apiClient.getEmployees({ limit: 50 });
      if (res && res.employees && res.employees.length > 0) {
        empOptions = res.employees.map(e => `<option value="${e.name}">${e.name} (${e.role || 'Employee'})</option>`).join('');
      }
    } catch (e) {}

    if (!empOptions) {
      empOptions = '<option value="Team Member">All Team Members</option>';
    }

    Swal.fire({
      title: 'Send Public Peer Recognition 🏆',
      html: `
        <select id="kudos-emp" class="swal2-input">
          ${empOptions}
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiClient.createPost({
            title: `Kudos to ${result.value.emp}! 🌟`,
            content: result.value.reason,
            badge: result.value.badge,
            priority: 'Kudos'
          });
          if (res && res.success) {
            setPosts(prev => [res.data, ...prev]);
            showSuccessToast(`Kudos posted for ${result.value.emp}!`);
          }
        } catch (err) {
          console.error(err);
          showErrorToast('Failed to post kudos.');
        }
      }
    });
  };

  const toggleLike = async (postId) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likedByMe: !p.likedByMe,
          likes: p.likedByMe ? Math.max(0, p.likes - 1) : p.likes + 1
        };
      }
      return p;
    }));

    try {
      await apiClient.toggleLikePost(postId);
    } catch (err) {
      console.error(err);
      fetchPosts();
    }
  };

  const filteredDocs = docs.filter(d => 
    (d.title || d.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (d.category || '').toLowerCase().includes(search.toLowerCase())
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
            {loadingPosts ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <MdRefresh className="text-3xl text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Loading social feed from MongoDB...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-600">No announcements posted yet.</p>
              </div>
            ) : posts.map((post) => (
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
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No birthdays or work anniversaries scheduled for today.
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
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Published Date</th>
                  <th className="px-6 py-3.5">Mandatory</th>
                  <th className="px-6 py-3.5 sticky right-0 bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{doc.id?.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{doc.title || doc.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">{doc.department || 'All Staff'}</td>
                    <td className="px-6 py-4 text-slate-600">{doc.uploadedOn || '01 Nov 2026'}</td>
                    <td className="px-6 py-4">
                      {doc.isMandatory ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Required</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500">Optional</span>
                      )}
                    </td>
                    <td className="px-6 py-4 sticky right-0 bg-white hover:bg-slate-50 shadow-[-8px_0_12px_rgba(0,0,0,0.05)]">
                      <button
                        onClick={() => showSuccessToast(`Downloading ${doc.title || doc.name}`)}
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
