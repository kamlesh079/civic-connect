import api from '../utils/axios';

export const issueService = {
  getMyIssues: async (
    params = {}
  ) => {
    const { data } =
      await api.get(
        '/issues/my',
        { params }
      );

    return data;
  },

  getIssueDetails: async (
    id
  ) => {
    const { data } =
      await api.get(
        `/issues/${id}`
      );

    return data;
  },

  createIssue: async (
    issueData
  ) => {
    const { data } =
      await api.post(
        '/issues',
        issueData
      );

    return data;
  }
};