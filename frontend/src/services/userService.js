import { get } from "mongoose";
import api from "./api";

const userService = {
  getUserDashboard: async () => {
    const response = await api.get(`/user/dashboard/`);
    return response.data;
  },
  getUserFollowers: async (userId) => {
    const response = await api.get(`/user/followers/`);
    return response.data;
  }, 
  getUserFollowing: async (userId) => {
    const response = await api.get(`/user/following/`);
    return response.data;
  },
};



export default userService;