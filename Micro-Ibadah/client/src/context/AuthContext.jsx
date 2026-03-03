/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authApi = axios.create({ baseURL: API_BASE_URL });

const normalizeUser = (user) => {
  if (!user) return null;
  const resolvedId = user._id || user.id;
  return {
    ...user,
    _id: resolvedId,
    id: resolvedId,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      authApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await authApi.get("/auth/me");
      setUser(normalizeUser(data));
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      delete authApi.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await authApi.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    authApi.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    const normalizedUser = normalizeUser(data.user);
    setUser(normalizedUser);
    return { ...data, user: normalizedUser };
  };

  const register = async (userData) => {
    const { data } = await authApi.post("/auth/register", userData);
    localStorage.setItem("token", data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    authApi.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    const normalizedUser = normalizeUser(data.user);
    setUser(normalizedUser);
    return { ...data, user: normalizedUser };
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    delete authApi.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
