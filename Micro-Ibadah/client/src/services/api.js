import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Set auth token on requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function request(method, url, data = null, params = null) {
  try {
    const response = await api({ method, url, data, params });
    return response.data;
  } catch (error) {
    console.error(`API Error [${method} ${url}]:`, error.response?.data || error.message);
    throw error;
  }
}

export const createStudent = (payload) => request("post", "/auth/student", payload);
export const saveRoutine = (userId, slots) => request("put", `/routines/${userId}`, { slots });
export const completeOnboarding = () => request("post", "/auth/complete-onboarding");
export const fetchQuranPlan = (payload) => request("post", "/quran/calculate", payload);
export const fetchQuranTracker = (userId, date) => request("get", `/quran/tracker/${userId}`, null, date ? { date } : {});
export const logQuranReading = (userId, payload) => request("post", `/quran/tracker/${userId}/log`, payload);
export const fetchDuas = () => request("get", "/duas");
export const fetchLeaderboard = () => request("get", "/leaderboard");
export const fetchDashboard = (userId) => request("get", `/progress/dashboard/${userId}`);
export const submitCheckIn = (userId) => request("post", `/progress/check-in/${userId}`);
export const updateTasbih = (userId, count) => request("put", `/progress/tasbih/${userId}`, { count });
export const saveReflection = (userId, prompt, text) => request("post", `/progress/reflection/${userId}`, { prompt, text });
export const logTaraweeh = (userId, day, count) => request("post", `/progress/taraweeh/${userId}`, { day, count });
export const executeCatchUp = (userId) => request("post", `/progress/catch-up/${userId}`);
export const createGroup = (userId, name) => request("post", "/groups/create", { userId, name });
export const joinGroup = (userId, inviteCode) => request("post", "/groups/join", { userId, inviteCode });
export const logShawwal = (userId, day) => request("post", `/progress/shawwal/${userId}`, { day });
export const fetchGroupDetails = (groupId) => request("get", `/groups/${groupId}`);
export const fetchUserGroups = (userId) => request("get", `/groups/user/${userId}`);
export const fetchJournalPrompt = (day) => request("get", "/journal/prompt", null, { day });
export const fetchJournalEntries = (userId) => request("get", `/journal/${userId}`);
export const saveJournalEntry = (userId, payload) => request("post", `/journal/${userId}`, payload);
export const fetchRpgProfile = (userId) => request("get", `/rpg/${userId}`);
export const awardBadge = (userId, badgeId) => request("post", `/rpg/${userId}/badge`, { badgeId });
export const sendAiCoachMessage = (message, userId) => request("post", "/ai-coach/chat", { message, userId });
export const fetchAdaptiveRoutine = (userId) => request("get", `/ai-coach/adaptive/${userId}`);
export const fetchDuaBoard = () => request("get", "/dua-board");
export const postDuaBoard = (text, category) => request("post", "/dua-board", { text, category });
export const sayAmeen = (duaId, userId) => request("post", `/dua-board/${duaId}/ameen`, userId ? { userId } : {});
export const fetchEidCard = (userId) => request("get", `/progress/eid-card/${userId}`);
export const generateEidCard = (userId) => request("post", `/progress/eid-card/${userId}/generate`);
export const fetchChallenges = (groupId) => request("get", "/challenges", null, groupId ? { groupId } : {});
export const createChallenge = (payload) => request("post", "/challenges", payload);
export const joinChallenge = (challengeId, userId) => request("post", `/challenges/${challengeId}/join`, { userId });
export const updateChallengeProgress = (challengeId, userId, increment) => request("post", `/challenges/${challengeId}/progress`, { userId, increment });
export const fetchAdminSettings = () => request("get", "/admin/settings");
export const updateAdminSettings = (payload) => request("put", "/admin/settings", payload);

