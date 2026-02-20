import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export async function createStudent(payload) {
  const response = await api.post("/auth/student", payload);
  return response.data;
}

export async function saveRoutine(userId, slots) {
  const response = await api.put(`/routines/${userId}`, { slots });
  return response.data;
}

export async function fetchQuranPlan(payload) {
  const response = await api.post("/quran/calculate", payload);
  return response.data;
}

export async function fetchDuas() {
  const response = await api.get("/duas");
  return response.data;
}

export async function fetchLeaderboard() {
  const response = await api.get("/leaderboard");
  return response.data;
}

export async function fetchDashboard(userId) {
  const response = await api.get(`/progress/dashboard/${userId}`);
  return response.data;
}

export async function submitCheckIn(userId) {
  const response = await api.post(`/progress/check-in/${userId}`);
  return response.data;
}
