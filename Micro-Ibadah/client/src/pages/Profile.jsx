import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { User, Trophy, Star, Zap, Settings, LogOut, ChevronRight, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { fetchRpgProfile, fetchAdminSettings } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BADGE_META = {
  night_owl: { label: "🦉 Night Owl", color: "bg-indigo-100 text-indigo-700" },
  streak_7: { label: "🔥 Week Warrior", color: "bg-orange-100 text-orange-700" },
  streak_30: { label: "💎 Diamond Ramadan", color: "bg-cyan-100 text-cyan-700" },
  tasbih_1000: { label: "📿 Dhikr Master", color: "bg-purple-100 text-purple-700" },
  quran_khatam: { label: "📖 Khatam Hero", color: "bg-emerald-100 text-emerald-700" },
  journal_7: { label: "✍️ Reflective Soul", color: "bg-amber-100 text-amber-700" },
  laylatul_qadr: { label: "⭐ Qadr Seeker", color: "bg-yellow-100 text-yellow-700" },
  early_bird: { label: "🌅 Fajr Champion", color: "bg-rose-100 text-rose-700" },
  group_leader: { label: "👑 Squad Leader", color: "bg-gold-100 text-yellow-800 bg-yellow-50" },
  helper: { label: "🤲 Dua Angel", color: "bg-teal-100 text-teal-700" },
};

const LEVEL_COLORS = {
  Salik: "from-gray-400 to-gray-600",
  Mureed: "from-blue-400 to-blue-600",
  Zahid: "from-purple-400 to-purple-600",
  Arif: "from-amber-400 to-amber-600",
  Wali: "from-emerald-400 to-emerald-600",
  Qutb: "from-red-400 to-rose-600",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rpgData, setRpgData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([
      fetchRpgProfile(user._id),
      fetchAdminSettings(),
    ]).then(([rpg, sett]) => {
      setRpgData(rpg);
      setSettings(sett);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-violet-50 to-purple-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-violet-600 font-medium">Loading your profile...</p>
      </div>
    </div>
  );

  const rpg = rpgData?.rpg;
  const currentLevel = rpg?.currentLevel;
  const gradientClass = LEVEL_COLORS[currentLevel?.level] || LEVEL_COLORS.Salik;
  const earnedBadges = rpgData?.earnedBadges || [];
  const allBadges = rpgData?.rareBadges || [];

  return (
    <div className={`min-h-screen bg-linear-to-br from-violet-50 via-white to-purple-50 py-6 px-4`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Hero */}
        <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`rounded-2xl bg-linear-to-r ${gradientClass} p-6 text-white shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black shadow-inner">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Level — {currentLevel?.level}</p>
                <h1 className="text-xl font-black">{user?.nickname || user?.name}</h1>
                <p className="text-sm opacity-80">{user?.department} · {user?.studentId}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-black">{rpgData?.user?.hasanatPoints || 0}</p>
                <p className="text-white/70 text-xs">Hasanat ⭐</p>
              </div>
            </div>

            {/* XP Progress */}
            {rpg && (
              <div className="mt-5">
                <div className="flex justify-between text-xs mb-1 opacity-80">
                  <span>{currentLevel?.level}</span>
                  <span>{rpg.xpToNext > 0 ? `${rpg.xp} / ${rpg.nextLevel?.minXp} XP` : "MAX LEVEL"}</span>
                  {rpg.nextLevel && <span>{rpg.nextLevel.level}</span>}
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rpg.progressPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </Motion.div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Streak", value: `${rpgData?.user?.streakDays || 0}d`, icon: "🔥" },
            { label: "Check-ins", value: rpgData?.user?.totalCheckIns || 0, icon: "✅" },
            { label: "Tasbih", value: rpgData?.user?.tasbihCount || 0, icon: "📿" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl bg-white border border-purple-100 p-3 text-center shadow-sm">
              <p className="text-2xl">{stat.icon}</p>
              <p className="text-lg font-black text-purple-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 p-1 bg-purple-100 rounded-xl">
          {[{ id: "stats", label: "📊 Stats" }, { id: "badges", label: "🏅 Badges" }, { id: "settings", label: "⚙️ Settings" }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id ? "bg-white text-purple-800 shadow-sm" : "text-purple-600 hover:text-purple-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "stats" && (
            <Motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* RPG Level Map */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800 text-sm">🗺️ Journey Map</CardTitle>
                  <CardDescription>Your spiritual rank progression</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(rpg?.allLevels || []).map((lvl, i) => {
                      const isCurrentLevel = lvl.level === currentLevel?.level;
                      const isPassed = (rpg?.xp || 0) >= lvl.minXp;
                      return (
                        <div key={lvl.level} className={`flex items-center gap-3 rounded-lg p-2.5 transition-all ${isCurrentLevel ? "bg-purple-50 border border-purple-300" : isPassed ? "opacity-60" : "opacity-30"}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${isPassed ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${isCurrentLevel ? "text-purple-800" : "text-gray-700"}`}>{lvl.level}</p>
                            <p className="text-xs text-gray-400">{lvl.minXp}+ XP</p>
                          </div>
                          {isCurrentLevel && <Badge className="bg-purple-600 text-white text-xs">Current</Badge>}
                          {!isCurrentLevel && isPassed && <span className="text-green-500 text-xs">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Reflections count */}
              {rpgData?.user?.journalEntries?.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-amber-800">
                      ✍️ You've written <strong>{rpgData.user.journalEntries.length}</strong> journal entries this Ramadan. Keep reflecting!
                    </p>
                  </CardContent>
                </Card>
              )}
            </Motion.div>
          )}

          {activeTab === "badges" && (
            <Motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">🏅 Rare Badges</CardTitle>
                  <CardDescription>{earnedBadges.length}/{allBadges.length} earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {allBadges.map(badge => {
                      const isEarned = earnedBadges.includes(badge.id);
                      const meta = BADGE_META[badge.id] || {};
                      return (
                        <Motion.div
                          key={badge.id}
                          whileHover={isEarned ? { scale: 1.01 } : {}}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                            isEarned ? `border-purple-200 ${meta.color || "bg-gray-50"}` : "border-gray-100 opacity-40 grayscale"
                          }`}
                        >
                          <span className="text-2xl">{badge.label.split(" ")[0]}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{badge.label.slice(badge.label.indexOf(" ") + 1)}</p>
                            <p className="text-xs text-gray-500">{badge.desc}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-purple-700">+{badge.xp} XP</p>
                            {isEarned && <p className="text-xs text-green-600">Earned ✓</p>}
                          </div>
                        </Motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </Motion.div>
          )}

          {activeTab === "settings" && (
            <Motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Salah Times from Admin */}
              {settings?.salahTimes && (
                <Card className="border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-800 text-sm">🕌 Salah Times (Configured by Admin)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(settings.salahTimes).map(([prayer, time]) => (
                        <div key={prayer} className="flex items-center justify-between rounded-lg bg-purple-50 border border-purple-100 px-3 py-2">
                          <p className="text-sm font-medium text-purple-800 capitalize">{prayer}</p>
                          <p className="text-sm font-mono text-purple-600">{time}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Broadcast message from admin */}
              {settings?.broadcastMessage && (
                <Card className="border-amber-300 bg-amber-50">
                  <CardContent className="pt-4">
                    <p className="text-sm font-semibold text-amber-800 mb-1">📢 Announcement</p>
                    <p className="text-sm text-amber-700">{settings.broadcastMessage}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-gray-200">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-800">Account</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="border-t pt-3">
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
