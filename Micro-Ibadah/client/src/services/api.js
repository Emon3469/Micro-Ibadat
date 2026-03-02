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

export async function createStudent(payload) {
  const response = await api.post("/auth/student", payload);
  return response.data;
}

export async function saveRoutine(userId, slots) {
  const response = await api.put(`/routines/${userId}`, { slots });
  return response.data;
}
export const completeOnboarding = async () => {
  const response = await api.post('/auth/complete-onboarding');
  return response.data;
};

export async function fetchQuranPlan(payload) {
  const response = await api.post("/quran/calculate", payload);
  return response.data;
}

export async function fetchQuranTracker(userId, date) {
  const response = await api.get(`/quran/tracker/${userId}`, {
    params: date ? { date } : {},
  });
  return response.data;
}

export async function logQuranReading(userId, payload) {
  const response = await api.post(`/quran/tracker/${userId}/log`, payload);
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

export async function updateTasbih(userId, count) {
  const response = await api.put(`/progress/tasbih/${userId}`, { count });
  return response.data;
}

export async function saveReflection(userId, prompt, text) {
  const response = await api.post(`/progress/reflection/${userId}`, { prompt, text });
  return response.data;
}

export async function logTaraweeh(userId, day, count) {
  const response = await api.post(`/progress/taraweeh/${userId}`, { day, count });
  return response.data;
}

export async function executeCatchUp(userId) {
  const response = await api.post(`/progress/catch-up/${userId}`);
  return response.data;
}

export async function createGroup(userId, name) {
  const response = await api.post("/groups/create", { userId, name });
  return response.data;
}

export async function joinGroup(userId, inviteCode) {
  const response = await api.post("/groups/join", { userId, inviteCode });
  return response.data;
}

export async function logShawwal(userId, day) {
  const response = await api.post(`/progress/shawwal/${userId}`, { day });
  return response.data;
}

export async function fetchGroupDetails(groupId) {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
}

export async function fetchUserGroups(userId) {
  const response = await api.get(`/groups/user/${userId}`);
  return response.data;
}

// Journal
export async function fetchJournalPrompt(day) {
  const response = await api.get("/journal/prompt", { params: { day } });
  return response.data;
}

export async function fetchJournalEntries(userId) {
  const response = await api.get(`/journal/${userId}`);
  return response.data;
}

export async function saveJournalEntry(userId, payload) {
  const response = await api.post(`/journal/${userId}`, payload);
  return response.data;
}

// RPG / Gamification
export async function fetchRpgProfile(userId) {
  const response = await api.get(`/rpg/${userId}`);
  return response.data;
}

export async function awardBadge(userId, badgeId) {
  const response = await api.post(`/rpg/${userId}/badge`, { badgeId });
  return response.data;
}

// AI Coach
export async function sendAiCoachMessage(message, userId) {
  const response = await api.post("/ai-coach/chat", { message, userId });
  return response.data;
}

export async function fetchAdaptiveRoutine(userId) {
  const response = await api.get(`/ai-coach/adaptive/${userId}`);
  return response.data;
}

// Dua Board
export async function fetchDuaBoard() {
  const response = await api.get("/dua-board");
  return response.data;
}

export async function postDuaBoard(text, category) {
  const response = await api.post("/dua-board", { text, category });
  return response.data;
}

export async function sayAmeen(duaId, userId) {
  const response = await api.post(`/dua-board/${duaId}/ameen`, userId ? { userId } : {});
  return response.data;
}

export async function fetchEidCard(userId) {
  const response = await api.get(`/progress/eid-card/${userId}`);
  return response.data;
}

export async function generateEidCard(userId) {
  const response = await api.post(`/progress/eid-card/${userId}/generate`);
  return response.data;
}

// Challenges
export async function fetchChallenges(groupId) {
  const response = await api.get("/challenges", { params: groupId ? { groupId } : {} });
  return response.data;
}

export async function createChallenge(payload) {
  const response = await api.post("/challenges", payload);
  return response.data;
}

export async function joinChallenge(challengeId, userId) {
  const response = await api.post(`/challenges/${challengeId}/join`, { userId });
  return response.data;
}

export async function updateChallengeProgress(challengeId, userId, increment) {
  const response = await api.post(`/challenges/${challengeId}/progress`, { userId, increment });
  return response.data;
}

// Admin
export async function fetchAdminSettings() {
  const response = await api.get("/admin/settings");
  return response.data;
}

export async function updateAdminSettings(payload) {
  const response = await api.put("/admin/settings", payload);
  return response.data;
}
