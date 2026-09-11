import api from '../utils/axios';

export const officerService = {
  getDashboardStats: async () => {
    const { data } =
      await api.get(
        '/officer/stats'
      );

    return data;
  },

  getAssignedIssues: async (
    params = {}
  ) => {
    const { data } =
      await api.get(
        '/officer/issues',
        { params }
      );

    return data;
  },

  getIssueDetails: async (
    id
  ) => {
    const { data } =
      await api.get(
        `/officer/issues/${id}`
      );

    return data;
  },

  updateIssueStatus: async (
    id,
    status,
    remarks = ''
  ) => {
    const { data } =
      await api.patch(
        `/officer/issues/${id}/status`,
        {
          status,
          remarks
        }
      );

    return data;
  },

  resolveIssue: async (
    id,
    remarks,
    resolutionImages = []
  ) => {
    const formData =
      new FormData();

    formData.append(
      'remarks',
      remarks
    );

    resolutionImages.forEach(
      (file) => {
        formData.append(
          'resolutionImages',
          file
        );
      }
    );

    const { data } =
      await api.patch(
        `/officer/issues/${id}/resolve`,
        formData
      );

    return data;
  }
};