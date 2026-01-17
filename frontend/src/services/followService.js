import api from './api';

export const followService = {
  addFollow: async (userId) => {
    const response = await api.post(`/follow/addFollow/${userId}`);
    return response.data;
  },

  removeFollow: async (userId) => {
    const response = await api.delete(`/follow/deleteFollow/${userId}`);
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/follow/getFollowers/${userId}`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/follow/getFollowing/${userId}`);
    return response.data;
  },
};