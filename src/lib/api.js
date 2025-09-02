import axios from "axios";

const API_BASE = "http://localhost:8000"; // later use env var

export const api = {
  getCustomers: () => axios.get(`${API_BASE}/customers/`),
  getUploads: () => axios.get(`${API_BASE}/uploads/`),
  getSegmentations: () => axios.get(`${API_BASE}/segmentations?limit=1&order=-created_date`),
  getCampaigns: () => axios.get(`${API_BASE}/campaigns/`),
  getActivity: () => axios.get(`${API_BASE}/activity/`)
};




export const Historyapi = {
  getUploads: () => axios.get(`${API_BASE}/uploads/`),
  getSegmentations: () => axios.get(`${API_BASE}/segmentations/`),
  getCampaigns: () => axios.get(`${API_BASE}/campaigns/`)
};
