const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API utility functions
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format');
      }

      console.log(`Response status: ${response.status}`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // If it's a network error or server is down
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.success && response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async register(userData: any) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.success && response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.removeToken();
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: any) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Reports endpoints
  async getReports(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/reports${queryString}`);
  }

  async getReport(id: string) {
    return this.request(`/reports/${id}`);
  }

  async createReport(reportData: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id: string, reportData: any) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async submitReport(id: string) {
    return this.request(`/reports/${id}/submit`, {
      method: 'PATCH',
    });
  }

  async approveReport(id: string) {
    return this.request(`/reports/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async archiveReport(id: string) {
    return this.request(`/reports/${id}/archive`, {
      method: 'PATCH',
    });
  }

  async duplicateReport(id: string) {
    return this.request(`/reports/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async deleteReport(id: string) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  async getReportStats() {
    return this.request('/reports/stats');
  }

  async exportReport(id: string) {
    return this.request(`/reports/${id}/export`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getRevenueChart(year?: number) {
    const params = year ? `?year=${year}` : '';
    return this.request(`/dashboard/charts/revenue${params}`);
  }

  async getExpenseChart(year?: number) {
    const params = year ? `?year=${year}` : '';
    return this.request(`/dashboard/charts/expenses${params}`);
  }

  async getProfitChart(year?: number) {
    const params = year ? `?year=${year}` : '';
    return this.request(`/dashboard/charts/profit${params}`);
  }

  async getBalanceSheetChart() {
    return this.request('/dashboard/charts/balance-sheet');
  }

  async getFinancialRatios() {
    return this.request('/dashboard/ratios');
  }

  async getComparativeAnalysis() {
    return this.request('/dashboard/analysis');
  }

  async getRecentActivity() {
    return this.request('/dashboard/activity');
  }

  // Quick Actions endpoints
  async createReviewSchedule(scheduleData: any) {
    return this.request('/quick-actions/schedule-review', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  async getReviewSchedules(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/quick-actions/schedules${queryString}`);
  }

  async updateScheduleStatus(id: string, status: string) {
    return this.request(`/quick-actions/schedule/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async archiveOldReports(data: any) {
    return this.request('/quick-actions/archive-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateFinancialAnalysis(data: any) {
    return this.request('/quick-actions/financial-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFinancialAnalyses(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/quick-actions/analyses${queryString}`);
  }

  async getArchiveLogs(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/quick-actions/archive-logs${queryString}`);
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settingsData: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  async resetSettings() {
    return this.request('/settings/reset', {
      method: 'POST',
    });
  }

  // Schedules endpoints
  async getSchedules(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/schedules${queryString}`);
  }

  async getSchedule(id: string) {
    return this.request(`/schedules/${id}`);
  }

  async createSchedule(scheduleData: any) {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  async updateSchedule(id: string, scheduleData: any) {
    return this.request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  }

  async markScheduleCompleted(id: string) {
    return this.request(`/schedules/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async addScheduleComment(id: string, comment: string) {
    return this.request(`/schedules/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async getUpcomingSchedules(days?: number) {
    const params = days ? `?days=${days}` : '';
    return this.request(`/schedules/upcoming${params}`);
  }

  async getOverdueSchedules() {
    return this.request('/schedules/overdue');
  }

  async deleteSchedule(id: string) {
    return this.request(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints (Admin only)
  async getUsers(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/users${queryString}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async toggleUserStatus(id: string) {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserActivity(id: string) {
    return this.request(`/users/${id}/activity`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;