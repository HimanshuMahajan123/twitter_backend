import api from "./api.js";

export const trendsService = {
  getTrends: async () => {
    const response = await api.get("/post/trending");
    return response.data?.data || {};
  },
};