import api from "./api";

const userService = {
  getUserDashboard: async () => {
    const response = await api.get(`/user/dashboard/`);
    return response.data;
  },

  toggleLike: async (postId) => {
    const response = await api.put(`/user/toggleLike/${postId}`);
    return response.data;
  },

  toggleFollow: async (userId) => {
    const response = await api.put(`/user/toggleFollow/${userId}`);
    return response.data;
  },

};



export default userService;