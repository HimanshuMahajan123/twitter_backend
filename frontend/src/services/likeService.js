import api from './api';

export const likeService = {
  addLike: async (postId) => {
    const response = await api.post(`/like/add/${postId}`);
    return response.data;
  },

  removeLike: async (postId) => {
    const response = await api.delete(`/like/delete/${postId}`);
    return response.data;
  },

  getPostLikes: async (postId) => {
    const response = await api.get(`/like/list/${postId}`);
    return response.data;
  },

  isPostLiked: async (postId) => {
    const response = await api.get(`/like/status/${postId}`);
    return response.data;
  },
};