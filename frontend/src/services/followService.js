import api from './api';

export const followService = {
  toggleFollow: async (userId) => {
    const response = await api.put(`/user/toggleFollow/${userId}`);
    return response.data;
  },



  getFollowers: async (userId) => {
    const response = await api.get(`/user/getFollowers/${userId}`);
    return response.data;
  },

  getFollowing: async () => {
    const response = await api.get(`/follow/getFollowing`);
    return response.data;
  },
};