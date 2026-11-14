// Centralized API Service powered by .env configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = {
  baseUrl: API_BASE_URL,

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('aayup_admin_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      return data;
    } catch (error) {
      console.warn(`[AayupOnes API Warning] ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Admin exclusive login API
  async adminLogin(empId, password) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ empId, password }),
    });
  },

  // Universal login
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile() {
    return this.request('/auth/me');
  },

  // Operations
  async getDocuments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/operations/documents${query ? `?${query}` : ''}`);
  },

  async getLeaves() {
    return this.request('/operations/leaves');
  },

  async getHolidays() {
    return this.request('/operations/holidays');
  },

  // Dynamic Dashboard Stats
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  },

  // Employees Management APIs
  async getEmployees(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/employees${query ? `?${query}` : ''}`);
  },

  async getEmployeeById(id) {
    return this.request(`/employees/${id}`);
  },

  async createEmployee(data) {
    return this.request('/employees/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resetEmployeePassword(id, newPassword, confirmPassword) {
    return this.request(`/employees/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
  },

  async deactivateEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  async verifyEmployeeSection(id, verificationPayload) {
    return this.request(`/employees/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(verificationPayload),
    });
  },

  // Approvals APIs
  async getApprovals(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/approvals${query ? `?${query}` : ''}`);
  },

  async approveApproval(id) {
    return this.request(`/approvals/${id}/approve`, {
      method: 'PATCH',
    });
  },

  async rejectApproval(id, reason) {
    return this.request(`/approvals/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  async bulkApproveAll() {
    return this.request('/approvals/bulk-approve', {
      method: 'POST',
    });
  },

  async getLeavePolicies() {
    return this.request('/approvals/policies');
  },

  async updateLeavePolicies(policies) {
    return this.request('/approvals/policies', {
      method: 'PATCH',
      body: JSON.stringify({ policies }),
    });
  },

  // Attendance APIs
  async getAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/attendance${query ? `?${query}` : ''}`);
  },

  async regularizeAttendance(payload) {
    return this.request('/attendance/regularize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Payroll APIs
  async getPayroll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payroll${query ? `?${query}` : ''}`);
  },

  async runPayrollBatch(month) {
    return this.request('/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ month }),
    });
  },

  // Payslips APIs
  async getPayslips(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payslips${query ? `?${query}` : ''}`);
  },

  async sendPayslip(payload) {
    return this.request('/payslips/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async sendBulkPayslips(payload) {
    return this.request('/payslips/send-bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Reimbursements APIs
  async getReimbursements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/reimbursements${query ? `?${query}` : ''}`);
  },

  async approveReimbursement(id) {
    return this.request(`/reimbursements/${id}/approve`, {
      method: 'PATCH',
    });
  },

  async rejectReimbursement(id, reason) {
    return this.request(`/reimbursements/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  // Operations & Helpdesk & Settings APIs
  async getDocumentsList() {
    return this.request('/operations/documents-list');
  },

  async issueEmployeeDocument(payload) {
    return this.request('/operations/documents/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteDocument(id) {
    return this.request(`/operations/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async getHelpdeskTickets() {
    return this.request('/operations/helpdesk-tickets');
  },

  async updateTicketStatus(id, payload) {
    return this.request(`/operations/helpdesk-tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getCompanySettings() {
    return this.request('/operations/settings');
  },

  async updateCompanySettings(settings) {
    return this.request('/operations/settings', {
      method: 'PATCH',
      body: JSON.stringify({ settings }),
    });
  },

  // Social Wall & Posts
  async getPosts() {
    return this.request('/operations/posts');
  },

  async createPost(postData) {
    return this.request('/operations/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async toggleLikePost(postId) {
    return this.request(`/operations/posts/${postId}/like`, {
      method: 'PATCH',
    });
  },

  // Offboarding & Exit Clearances
  async getOffboardingCases() {
    return this.request('/operations/offboarding');
  },

  async updateClearance(caseId, clearanceKey, value) {
    return this.request(`/operations/offboarding/${caseId}/clearance`, {
      method: 'PATCH',
      body: JSON.stringify({ clearanceKey, value }),
    });
  },

  async finalizeSettlement(caseId) {
    return this.request(`/operations/offboarding/${caseId}/settle`, {
      method: 'PATCH',
    });
  },

  // Announcements & Push Notifications
  async broadcastAnnouncement(payload) {
    return this.request('/announcements/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAnnouncements() {
    return this.request('/announcements');
  },

  // Profile API
  async getCurrentUserProfile() {
    return this.request('/auth/me');
  },

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

export default apiClient;
