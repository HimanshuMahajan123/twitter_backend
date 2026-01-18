import api from "./api";

const userService = {
  getUserDashboard: async () => {
    const response = await api.get(`/user/dashboard/`);
    return response.data;
  },

};



export default userService;