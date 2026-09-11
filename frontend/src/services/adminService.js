import api from "../utils/axios";

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const { data } = await api.get("/admin/issues/stats");
    return data;
  },

  // Issues
  getIssues: async (params = {}) => {
    const { data } = await api.get("/admin/issues", { params });
    return data;
  },

  assignIssue: async (id, officerId) => {
    const { data } = await api.patch(`/admin/issues/${id}/assign`, {
      officerId,
    });
    return data;
  },
  getIssueDetails: async (id) => {
    const { data } = await api.get(`/admin/issues/${id}`);
    return data;
  },

  updatePriority: async (id, priority) => {
    const { data } = await api.patch(`/admin/issues/${id}/priority`, {
      priority,
    });
    return data;
  },

  // Users & Officers
  getUsers: async (params = {}) => {
    const { data } = await api.get("/admin/users", { params });
    return data;
  },

  updateUserRole: async (id, role) => {
    const { data } = await api.patch(`/admin/users/${id}`, { role });
    return data;
  },

  // Categories
  getCategories: async () => {
    const { data } = await api.get("/categories");
    return data;
  },

  createCategory: async (categoryData) => {
    const { data } = await api.post("/categories", categoryData);
    return data;
  },
};
