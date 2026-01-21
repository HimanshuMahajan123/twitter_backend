import api from './api';

export const repostService = {
  createRepost: async (postId) => {
    const response = await api.post(`/post/repost/${postId}`);
    return response.data;
  },
};