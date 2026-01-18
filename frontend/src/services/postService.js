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
 fetchFeedPosts: async (cursor = null, limit = 10) => {
  const params = { limit };

  if (cursor) {
    params.cursor = cursor; 
  }

  const response = await api.get("/post/feed", { params });
  return response.data.data;
},


};