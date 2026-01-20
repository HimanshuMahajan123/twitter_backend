import api from './api';

export const likeService = {
  
  toggleLike  : async (postId) => {
    const response = await api.put(`/user/toggleLike/${postId}`);
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