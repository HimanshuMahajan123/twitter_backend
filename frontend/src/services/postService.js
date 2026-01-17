import api from './api';

export const postService = {
  createPost: async (formData) => {
    const response = await api.post('/post/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFeedPosts: async (page = 1, limit = 10) => {
    const response = await api.get('/post/feed', {
      params: { page, limit },
    });
    return response.data;
  },
};