import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Dhikr from "./pages/Dhikr";
import Dua from "./pages/Dua";
import Quran from "./pages/Quran";
import Profile from "./pages/Profile";
import AiCoach from "./pages/AiCoach";
import RamadanMap from "./pages/RamadanMap";
import Challenges from "./pages/Challenges";
import Journal from "./pages/Journal";
import Admin from "./pages/Admin";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex bg-base-50 items-center justify-center min-h-screen text-slate-500">Loading Micro-Ibadah...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="dua" element={<ProtectedRoute><Dua /></ProtectedRoute>} />
            <Route path="dhikr" element={<ProtectedRoute><Dhikr /></ProtectedRoute>} />

            {/* Phase 2 */}
            <Route path="quran" element={<ProtectedRoute><Quran /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="leaderboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Phase 3 */}
            <Route path="ai-coach" element={<ProtectedRoute><AiCoach /></ProtectedRoute>} />
            <Route path="ramadan-map" element={<ProtectedRoute><RamadanMap /></ProtectedRoute>} />
            <Route path="challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />

            {/* Phase 4 */}
            <Route path="journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />

            {/* Phase 5 - Admin */}
            <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
