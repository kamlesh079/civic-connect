import api from '../utils/axios';

export const officerService = {
  getDashboardStats: async () => {
    const { data } = await api.get('/officer/stats');
    return data;
  },
  getAssignedIssues: async (params = {}) => {
    const { data } = await api.get('/officer/issues', { params });
    return data;
  },
  getIssueDetails: async (id) => {
    const { data } = await api.get(`/officer/issues/${id}`);
    return data;
  },
  updateIssue: async (id, updateData) => {
    const { data } = await api.put(`/officer/issues/${id}`, updateData);
    return data;
  }
};