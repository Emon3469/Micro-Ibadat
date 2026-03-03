import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, BookOpenText, Clock3, Flame, Trophy, Fingerprint, LifeBuoy, Bot, Map, Sparkles } from "lucide-react";
import { createStudent, fetchDashboard, fetchDuas, fetchLeaderboard, fetchQuranPlan, saveRoutine, submitCheckIn, updateTasbih, saveReflection, logTaraweeh, executeCatchUp, logShawwal, fetchAdminSettings, fetchEidCard, generateEidCard } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import GroupCircle from "../components/GroupCircle";
import WeeklyCard from "../components/WeeklyCard";

const routineTemplate = [
  { start: "08:30", end: "09:30", type: "class", activity: "none", durationMinutes: 5 },
  { start: "09:30", end: "09:45", type: "free", activity: "quran", durationMinutes: 5 },
  { start: "12:30", end: "13:30", type: "free", activity: "dua", durationMinutes: 2 },
  { start: "17:00", end: "17:15", type: "free", activity: "quran", durationMinutes: 10 },
];

const quranPresets = [
  { ayahsPerRead: 5, timesPerDay: 4 },
  { ayahsPerRead: 10, timesPerDay: 3 },
  { ayahsPerRead: 12, timesPerDay: 3 },
  { ayahsPerRead: 15, timesPerDay: 2 },
  { ayahsPerRead: 20, timesPerDay: 2 },
];

const RAMADAN_VERSES = [
  {
    arabic: "شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ",
    translation: "The month of Ramadan in which the Qur'an was revealed.",
    reference: "Qur'an 2:185",
  },
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    reference: "Qur'an 94:6",
  },
  {
    arabic: "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنْفَعُ الْمُؤْمِنِينَ",
    translation: "Remind, for indeed the reminder benefits the believers.",
    reference: "Qur'an 51:55",
  },
  {
    arabic: "إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ",
    translation: "Indeed, my Lord is with me; He will guide me.",
    reference: "Qur'an 26:62",
  },
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translation: "And say, My Lord, increase me in knowledge.",
    reference: "Qur'an 20:114",
  },
];

// Suhoor/Iftar Countdown
function useCountdown(targetTimeStr) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!targetTimeStr) return;
    const update = () => {
      const now = new Date();
      const [h, m] = targetTimeStr.split(":").map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor((diff % 3600000) / 60000);
      const ss = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hh}h ${mm}m ${ss}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetTimeStr]);
  return timeLeft;
}

function SuhoorIftarCard({ salahTimes }) {
  const suhoorCountdown = useCountdown(salahTimes?.suhoor || "04:30");
  const iftarCountdown = useCountdown(salahTimes?.iftar || salahTimes?.maghrib || "18:10");
  const now = new Date();
  const currentHour = now.getHours();
  const isSuhoorTime = currentHour < 5 || currentHour >= 23;
  const activeLabel = isSuhoorTime ? "suhoor" : "iftar";
  const activeCountdown = isSuhoorTime ? suhoorCountdown : iftarCountdown;
  const activeEmoji = isSuhoorTime ? "🌙" : "🌅";

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
      <Card className="border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeEmoji}</span>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  {isSuhoorTime ? "Time until Suhoor ends" : "Time until Iftar"}
                </p>
                <p className="text-2xl font-black text-amber-900 font-mono">{activeCountdown}</p>
              </div>
            </div>
            <div className="text-right text-xs text-amber-600">
              <p>🌙 Suhoor: {salahTimes?.suhoor || "04:30"}</p>
              <p>🌅 Iftar: {salahTimes?.iftar || salahTimes?.maghrib || "18:10"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EidCard({ user, card }) {
  const [downloaded, setDownloaded] = useState(false);
  const handleShare = async () => {
    const text = `🎉 Eid Mubarak! I completed 30 days of Micro-Ibadah with ${card?.hasanatPoints || user?.hasanatPoints || 0} Hasanat points! May Allah accept from all of us. #MicroIbadah #EidMubarak`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    }
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="border-yellow-300 shadow-lg overflow-hidden" style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d1066 50%, #1a0533 100%)" }}>
        <CardContent className="pt-6 pb-6 text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-5xl mb-3">🌙</motion.div>
          <p className="text-yellow-300 text-xs font-semibold uppercase tracking-widest mb-1">Eid Mubarak</p>
          <h2 className="text-2xl font-black text-white mb-1">{card?.name || user?.name || user?.nickname}</h2>
          <p className="text-yellow-200 text-sm mb-3">Completed 30 Days of Micro-Ibadah</p>
          <div className="flex justify-center gap-4 mb-4">
            <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
              <p className="text-2xl font-black text-yellow-300">{card?.hasanatPoints || user?.hasanatPoints || 0}</p>
              <p className="text-white/60 text-xs">Hasanat ⭐</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
              <p className="text-2xl font-black text-yellow-300">{card?.streakDays || user?.streakDays || 0}</p>
              <p className="text-white/60 text-xs">Day Streak</p>
            </div>
          </div>
          <p className="text-yellow-200/70 text-xs italic mb-4">{card?.message || '"Indeed, every deed is judged by intention."'}</p>
          <Button onClick={handleShare} className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold">
            {downloaded ? "Copied! ✓" : "🎉 Share Eid Card"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RamadanVerseCard({ card }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `🌙 Ramadan Verse Card\n\n${card?.arabic}\n${card?.translation}\n${card?.reference}\n\nDay ${card?.day} · ${card?.name}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
      <Card className="border-indigo-300 shadow-lg overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #0f172a 100%)" }}>
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-2">Ramadan Verse Card</p>
          <p className="text-white text-2xl leading-loose mb-3" dir="rtl">{card?.arabic}</p>
          <p className="text-indigo-100 text-sm mb-2">{card?.translation}</p>
          <p className="text-indigo-300/80 text-xs mb-4">{card?.reference}</p>
          <div className="rounded-xl bg-white/10 px-3 py-2 text-xs text-indigo-100 mb-4">
            Day {card?.day} · {card?.name}
          </div>
          <Button onClick={handleShare} className="bg-indigo-300 hover:bg-indigo-200 text-indigo-900 font-semibold">
            {copied ? "Copied! ✓" : "📤 Share Verse Card"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [student, setStudent] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "CSE",
    nickname: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [slots, setSlots] = useState(routineTemplate);
  const [quranInput, setQuranInput] = useState({ ayahsPerRead: 10, timesPerDay: 3 });
  const [quranPlan, setQuranPlan] = useState(null);
  const [duas, setDuas] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [currentRamadanDay, setCurrentRamadanDay] = useState(1);
  const [isLast10Nights, setIsLast10Nights] = useState(() => (localStorage.getItem("app_theme") || "ramadan") === "ramadan-night");
  const [adminSettings, setAdminSettings] = useState(null);
  const [eidCardData, setEidCardData] = useState(null);
  const [eidGenerating, setEidGenerating] = useState(false);
  const [ramadanVerseCard, setRamadanVerseCard] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const currentUserId = currentUser?._id || currentUser?.id;

  const quranProgress = useMemo(() => {
    if (!quranPlan?.totalAyahsPerDay) return 0;
    return Math.min(100, Math.round((quranPlan.totalAyahsPerDay / 60) * 100));
  }, [quranPlan]);

  const hasCompletedDay30 = useMemo(() => {
    return (dashboard?.user?.taraweehDays || []).some((entry) => entry.day >= 30 && entry.logged);
  }, [dashboard?.user?.taraweehDays]);

  useEffect(() => {
    const loadStatic = async () => {
      try {
        const [duaRes, leaderboardRes, adminRes] = await Promise.all([
          fetchDuas(), fetchLeaderboard(), fetchAdminSettings()
        ]);
        setDuas(duaRes);
        setLeaderboard(leaderboardRes);
        if (adminRes) setAdminSettings(adminRes);
      } catch (err) {
        console.error("Dashboard static load error:", err);
        setGlobalError("Failed to load some data. Please check your connection.");
      }
    };
    loadStatic();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const resolvedId = authUser._id || authUser.id;

    setCurrentUser((prev) => {
      const previousId = prev?._id || prev?.id;
      if (previousId === resolvedId) return prev;
      return authUser;
    });

    setStudent((prev) => ({
      ...prev,
      name: authUser.name || prev.name,
      email: authUser.email || prev.email,
      studentId: authUser.studentId || prev.studentId,
      department: authUser.department || prev.department,
      nickname: authUser.nickname || prev.nickname,
    }));
  }, [authUser]);

  useEffect(() => {
    if (!currentUserId) return;
    fetchDashboard(currentUserId)
      .then(setDashboard)
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setGlobalError("Unable to load personal progress.");
      });
  }, [currentUserId]);

  useEffect(() => {
    const taraweehDays = dashboard?.user?.taraweehDays || [];
    if (taraweehDays.length === 0) return;

    const completedDay30 = taraweehDays.some((entry) => entry.day >= 30 && entry.logged);
    if (completedDay30) {
      setCurrentRamadanDay(31);
      return;
    }

    const highestLogged = taraweehDays
      .filter((entry) => entry.logged)
      .reduce((maxDay, entry) => Math.max(maxDay, entry.day || 0), 0);

    setCurrentRamadanDay(Math.min(30, Math.max(1, highestLogged + 1)));
  }, [dashboard?.user?.taraweehDays]);

  useEffect(() => {
    const maybeGenerateEidCard = async () => {
      if (!currentUserId || !dashboard?.user || !hasCompletedDay30) return;

      try {
        const existing = await fetchEidCard(currentUserId);
        if (existing?.generated) {
          setEidCardData(existing.card);
          return;
        }

        setEidGenerating(true);
        const generated = await generateEidCard(currentUserId);
        setEidCardData(generated.card);
      } catch {
      } finally {
        setEidGenerating(false);
      }
    };

    maybeGenerateEidCard();
  }, [currentUserId, dashboard?.user, hasCompletedDay30]);

  const handleGenerateEidCard = async () => {
    if (!currentUserId || !hasCompletedDay30) return;
    try {
      setEidGenerating(true);
      const generated = await generateEidCard(currentUserId);
      setEidCardData(generated.card);
    } catch {
    } finally {
      setEidGenerating(false);
    }
  };

  const handleGenerateRamadanVerseCard = () => {
    const randomVerse = RAMADAN_VERSES[Math.floor(Math.random() * RAMADAN_VERSES.length)];
    setRamadanVerseCard({
      ...randomVerse,
      day: Math.min(30, currentRamadanDay),
      name: dashboard?.user?.nickname || dashboard?.user?.name || currentUser?.name || "Micro-Ibadah User",
    });
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const user = await createStudent(student);
      const resolvedId = user?._id || user?.id;
      setCurrentUser({ ...user, _id: resolvedId, id: resolvedId });
      const dashboardData = await fetchDashboard(resolvedId);
      setDashboard(dashboardData);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutineSave = async () => {
    if (!currentUserId) return;
    await saveRoutine(currentUserId, slots);
    const dashboardData = await fetchDashboard(currentUserId);
    setDashboard(dashboardData);
  };

  const handleQuranCalc = async (preset = null) => {
    const payload = preset || quranInput;
    setQuranInput(payload);
    const result = await fetchQuranPlan(payload);
    setQuranPlan(result);
  };

  const handleCheckIn = async () => {
    if (!currentUserId) return;
    const user = await submitCheckIn(currentUserId);
    setCurrentUser(user);
    const [dashboardData, leaderboardRes] = await Promise.all([
      fetchDashboard(currentUserId),
      fetchLeaderboard(),
    ]);
    setDashboard(dashboardData);
    setLeaderboard(leaderboardRes);
  };

  const handleSaveReflection = async () => {
    if (!currentUserId || !reflectionText.trim()) return;
    const prompt = dashboard?.reflectionPrompt || "What tiny ibadah block worked best for you today?";
    const data = await saveReflection(currentUserId, prompt, reflectionText);
    setDashboard((prev) => prev ? { ...prev, user: { ...prev.user, reflections: data.reflections } } : prev);
    setReflectionSaved(true);
    setReflectionText("");
  };

  const handleLogTaraweeh = async (count) => {
    if (!currentUserId) return;
    const data = await logTaraweeh(currentUserId, currentRamadanDay, count);
    setDashboard((prev) => prev ? { ...prev, user: { ...prev.user, taraweehDays: data.taraweehDays } } : prev);
    setCurrentRamadanDay(prev => prev < 30 ? prev + 1 : 31);
  };

  const handleCatchUp = async () => {
    if (!currentUserId) return;
    const user = await executeCatchUp(currentUserId);
    setCurrentUser(user);
    const dashboardData = await fetchDashboard(currentUserId);
    setDashboard(dashboardData);
  };

  const handleLogShawwal = async (day) => {
    if (!currentUserId) return;
    const data = await logShawwal(currentUserId, day);
    setDashboard((prev) => prev ? { ...prev, user: { ...prev.user, shawwalDays: data.shawwalDays, hasanatPoints: data.hasanatPoints } } : prev);
  };

  useEffect(() => {
    if (hasCompletedDay30) {
      setRamadanVerseCard(null);
    }
  }, [hasCompletedDay30]);

  const isNightTheme = isLast10Nights;
  const themeStyles = isNightTheme 
    ? "min-h-screen text-slate-100 transition-colors duration-700" 
    : "min-h-screen transition-colors duration-700";

  const handleThemeToggle = () => {
    setIsLast10Nights((previous) => {
      const next = !previous;
      const nextTheme = next ? "ramadan-night" : "ramadan";
      localStorage.setItem("app_theme", nextTheme);
      window.dispatchEvent(new Event("app-theme-change"));
      return next;
    });
  };

  return (
    <div className={`${themeStyles} mx-auto w-full px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
      {globalError && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 rounded-xl bg-red-50 p-4 border border-red-200 flex items-center justify-between"
        >
          <p className="text-sm text-red-800">⚠️ {globalError}</p>
          <button onClick={() => setGlobalError(null)} className="text-xs font-bold text-red-900 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-100">Dismiss</button>
        </motion.div>
      )}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`mb-6 rounded-2xl border p-6 shadow-sm backdrop-blur-sm ${
          isNightTheme ? "border-slate-800 bg-slate-900/90 text-slate-200" : "border-base-300 bg-base-100/90"
        }`}
      >
        <div className="flex w-full items-center justify-between">
          <div>
            <Badge className="mb-3 border-amber-200 bg-amber-100 text-amber-800">Ramadan MVP</Badge>
            <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-4xl">Micro-Ibadah</h1>
            <p className="mt-2 text-sm text-base-content/75 sm:text-base">Busy schedule. Small deeds. Big consistency.</p>
          </div>
          {currentUser && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-4">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isNightTheme ? 'text-indigo-300' : 'text-slate-500'}`}>Last 10 Nights</span>
                <button 
                  onClick={handleThemeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isLast10Nights ? 'bg-indigo-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isLast10Nights ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <motion.div 
                 key={dashboard?.user?.hasanatPoints}
                 initial={{ scale: 1.2, color: "#f59e0b" }}
                 animate={{ scale: 1, color: "#92400e" }}
                 className={`flex flex-col items-center justify-center rounded-xl border px-4 py-2 shadow-sm ${
                   isNightTheme ? "border-amber-500/30 bg-amber-900/20" : "border-amber-200 bg-amber-50"
                 }`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${isNightTheme ? "text-amber-400" : "text-amber-700/80"}`}>Hasanat</span>
                <span className={`flex items-center gap-1 text-2xl font-black ${isNightTheme ? "text-amber-300" : "text-amber-600"}`}>
                  ⭐ {dashboard?.user?.hasanatPoints || 0}
                </span>
              </motion.div>
            </div>
          )}
        </div>
      </motion.header>

      {/* Admin Broadcast Banner */}
      {adminSettings?.broadcastMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">Announcement</p>
            <p className="text-sm text-amber-900 font-medium">{adminSettings.broadcastMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Laylatul Qadr Pinned Content */}
      {isLast10Nights && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-indigo-500/30 bg-indigo-900/60 p-5 shadow-lg backdrop-blur text-indigo-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-lg font-bold">✨ Laylatul Qadr Pinned Content</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/10 p-4 border border-white/10">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Recommended Dua</p>
              <p className="text-xl font-arabic text-right mb-2" dir="rtl">اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي</p>
              <p className="text-xs text-indigo-200 italic">"O Allah, You are Pardoning and You love to pardon, so pardon me."</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 border border-white/10 space-y-2">
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">Checklist for Tonight</p>
              <div className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Pray Isha in congregation</div>
              <div className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Read at least 5 ayahs</div>
              <div className="flex items-center gap-2 text-sm"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Make dua for others</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Automated Eid Card (Day 31 or if Day 30 complete) */}
      {(currentRamadanDay === 31 || hasCompletedDay30) && (
        <div className="mb-6">
          <EidCard user={currentUser} />
        </div>
      )}

      <main className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle>1) Student Onboarding</CardTitle>
              <CardDescription>Sign in with student identity to personalize your routine and leaderboard.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Full name" value={student.name} onChange={(event) => setStudent((prev) => ({ ...prev, name: event.target.value }))} />
              <Input placeholder="Student email" value={student.email} onChange={(event) => setStudent((prev) => ({ ...prev, email: event.target.value }))} />
              <Input placeholder="Student ID" value={student.studentId} onChange={(event) => setStudent((prev) => ({ ...prev, studentId: event.target.value }))} />
              <Input placeholder="Department" value={student.department} onChange={(event) => setStudent((prev) => ({ ...prev, department: event.target.value }))} />
              <Input className="sm:col-span-2" placeholder="Optional nickname (for anonymous board)" value={student.nickname} onChange={(event) => setStudent((prev) => ({ ...prev, nickname: event.target.value }))} />
              <Button className="sm:col-span-2" onClick={handleRegister} disabled={loading}>
                {loading ? "Saving..." : "Save Student Profile"}
              </Button>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle>2) Daily Routine System</CardTitle>
              <CardDescription>Use tiny blocks (2/5/10 minutes). No slot exceeds 10 minutes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {slots.map((slot, index) => (
                <motion.div layout key={`${slot.start}-${index}`} className="grid grid-cols-2 gap-2 rounded-xl border border-base-300 bg-base-200/60 p-3 sm:grid-cols-5" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
                  <Input value={slot.start} onChange={(event) => setSlots((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, start: event.target.value } : item)))} />
                  <Input value={slot.end} onChange={(event) => setSlots((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, end: event.target.value } : item)))} />
                  <select className="rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm" value={slot.type} onChange={(event) => setSlots((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, type: event.target.value } : item)))}>
                    <option value="class">Class</option>
                    <option value="free">Free</option>
                  </select>
                  <select className="rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm" value={slot.activity} onChange={(event) => setSlots((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, activity: event.target.value } : item)))}>
                    <option value="none">None</option>
                    <option value="quran">Qur'an</option>
                    <option value="dua">Dua</option>
                    <option value="dhikr">Dhikr</option>
                  </select>
                  <select className="rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm" value={slot.durationMinutes} onChange={(event) => setSlots((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, durationMinutes: Number(event.target.value) } : item)))}>
                    <option value={2}>2m</option>
                    <option value={5}>5m</option>
                    <option value={10}>10m</option>
                  </select>
                </motion.div>
              ))}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="secondary" onClick={() => setSlots((prev) => [...prev, { start: "", end: "", type: "free", activity: "dua", durationMinutes: 5 }])}>Add Slot</Button>
                <Button onClick={handleRoutineSave} disabled={!currentUserId}>Save Routine</Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle>3) Qur'an Reading Calculator</CardTitle>
              <CardDescription>Choose a tiny repeatable pattern and track completion pace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {quranPresets.map((preset) => (
                  <Button key={`${preset.ayahsPerRead}-${preset.timesPerDay}`} variant="secondary" onClick={() => handleQuranCalc(preset)}>{preset.ayahsPerRead} × {preset.timesPerDay}/day</Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Input type="number" min={1} placeholder="Ayahs per read" value={quranInput.ayahsPerRead} onChange={(event) => setQuranInput((prev) => ({ ...prev, ayahsPerRead: Number(event.target.value) }))} />
                <Input type="number" min={1} placeholder="Reads per day" value={quranInput.timesPerDay} onChange={(event) => setQuranInput((prev) => ({ ...prev, timesPerDay: Number(event.target.value) }))} />
                <Button className="col-span-2" onClick={() => handleQuranCalc()}>Calculate Plan</Button>
              </div>
              <AnimatePresence>
                {quranPlan ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                  >
                    <p className="text-sm text-emerald-800">Total ayahs/day: <strong>{quranPlan.totalAyahsPerDay}</strong></p>
                    <p className="text-sm text-emerald-800">Days to completion: <strong>{quranPlan.daysToCompletion}</strong></p>
                    <p className="mt-1 text-xs text-emerald-700">{quranPlan.paceText}</p>
                    <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 0.45 }}>
                      <Progress value={quranProgress} className="mt-3" />
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          {currentRamadanDay <= 30 ? (
            <Card className="border-indigo-200 bg-indigo-50/90 shadow-sm mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-indigo-800">🌙 Taraweeh Tracker</CardTitle>
                <CardDescription className="text-indigo-700/80">Did you pray Taraweeh tonight (Day {currentRamadanDay})?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleLogTaraweeh(8)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Yes (8)</Button>
                  <Button onClick={() => handleLogTaraweeh(20)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Yes (20)</Button>
                  <Button onClick={() => handleLogTaraweeh(2)} variant="outline" className="text-indigo-800 border-indigo-200 bg-indigo-100 hover:bg-indigo-200">Partially</Button>
                  <Button onClick={() => handleLogTaraweeh(0)} variant="outline" className="text-indigo-800 border-indigo-200 bg-white hover:bg-indigo-50">No</Button>
                  {/* Dev Helper - Skip to Eid */}
                  <Button size="sm" variant="ghost" className="text-xs text-indigo-400 opacity-50 ml-auto" onClick={() => setCurrentRamadanDay(31)}>Skip to Eid</Button>
                </div>
                <div className="mt-4 pt-4 border-t border-indigo-200/50">
                  <p className="text-xs font-semibold text-indigo-800 mb-2">30-Day Tracker</p>
                  <div className="grid grid-cols-10 gap-1 sm:flex sm:flex-wrap">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const day = i + 1;
                      const loggedDay = dashboard?.user?.taraweehDays?.find(t => t.day === day);
                      let color = "bg-indigo-100/50 border-indigo-200";
                      let textColor = "text-indigo-400";
                      if (loggedDay?.logged) {
                        textColor = "text-white";
                        if (loggedDay.count >= 8) color = "bg-indigo-600 border-indigo-600";
                        else if (loggedDay.count > 0) color = "bg-indigo-400 border-indigo-400";
                        else { color = "bg-slate-200 border-slate-300 opacity-50"; textColor = "text-slate-500"; }
                      }
                      if (day === currentRamadanDay && !loggedDay?.logged) {
                        color = "bg-indigo-200 border-indigo-400 animate-pulse";
                        textColor = "text-indigo-700";
                      }
                      
                      return (
                        <div 
                          key={day} 
                          className={`h-7 w-7 sm:h-6 sm:w-6 rounded-md border flex items-center justify-center text-[10px] font-medium transition-colors ${color} ${textColor}`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!hasCompletedDay30 && (
                  <div className="rounded-lg border border-indigo-200 bg-white/80 p-3">
                    <p className="text-sm font-semibold text-indigo-800 mb-2">🌙 Beautiful Ramadan Verse Card</p>
                    <Button onClick={handleGenerateRamadanVerseCard} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      Generate Verse Card
                    </Button>
                  </div>
                )}

                {ramadanVerseCard && !hasCompletedDay30 && <RamadanVerseCard card={ramadanVerseCard} />}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-teal-200 bg-linear-to-br from-teal-50 to-emerald-50 shadow-sm mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-teal-800">✨ Eid Mubarak! Keep Going</CardTitle>
                <CardDescription className="text-teal-700/80">Ramadan is over, but consistency remains. Track your 6 days of Shawwal for an immense reward.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eidGenerating && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                    Generating your Eid card...
                  </div>
                )}

                {!eidCardData && hasCompletedDay30 && !eidGenerating && (
                  <div className="rounded-lg border border-teal-200 bg-white/80 p-3">
                    <p className="text-sm font-semibold text-teal-800 mb-2">🎨 Personalized Eid Card Generator</p>
                    <Button onClick={handleGenerateEidCard} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                      Generate My Eid Card
                    </Button>
                  </div>
                )}

                {eidCardData && <EidCard user={dashboard?.user || currentUser} card={eidCardData} />}

                <div className="flex gap-2 p-3 bg-white/60 rounded-lg border border-teal-100">
                  <Clock3 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-800">"Whoever fasts Ramadan, then follows it with six days of Shawwal, it is as if they fasted for a lifetime." <span className="text-xs opacity-70 block mt-1">(Sahih Muslim)</span></p>
                </div>
                
                <div className="grid grid-cols-6 gap-2 mt-4 pt-2">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const day = i + 1;
                    const isLogged = dashboard?.user?.shawwalDays?.find(f => f.day === day && f.logged);
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleLogShawwal(day)}
                        className={`h-12 rounded-xl flex items-center justify-center transition-all ${
                          isLogged 
                            ? "bg-teal-500 text-white shadow-md border-b-4 border-teal-700 -translate-y-0.5" 
                            : "bg-white text-teal-600 border border-teal-200 hover:bg-teal-50"
                        }`}
                      >
                        {isLogged ? "✓" : `Day ${day}`}
                      </button>
                    );
                  })}
                </div>
                <Button variant="ghost" size="sm" className="w-full text-teal-600 hover:text-teal-700 mt-2 hover:bg-teal-100/50" onClick={() => setCurrentRamadanDay(1)}>← Back to Ramadan Mode</Button>
              </CardContent>
            </Card>
          )}
          </motion.div>

          <GroupCircle 
            currentUser={currentUser} 
            onGroupJoined={() => currentUserId ? fetchDashboard(currentUserId).then(setDashboard) : Promise.resolve()} 
          />

        </section>

        <aside className="space-y-4">
          {/* Suhoor/Iftar Countdown */}
          {adminSettings?.salahTimes && <SuhoorIftarCard salahTimes={adminSettings.salahTimes} />}

          <WeeklyCard user={currentUser} dashboard={dashboard} />
          
          <AnimatePresence>
            {dashboard?.user?.lastMissedDate && dashboard?.user?.streakDays < 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
                <Card className="border-rose-200 bg-rose-50/90 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><LifeBuoy className="h-16 w-16 text-rose-600" /></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-rose-800"><LifeBuoy className="h-4 w-4" /> Catch-up Mode</CardTitle>
                    <CardDescription className="text-rose-700/80">You missed a day recently. Don't let it break you!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 relative z-10">
                    <p className="text-sm font-medium text-rose-800">Complete a 3-minute mini session right now to restore your streak (+3 days) and earn 20 bonus Hasanat.</p>
                    <Button onClick={handleCatchUp} className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-sm">Execute Soft Recovery</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>


          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Today's Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <p>Completed: <strong>{dashboard?.todayCompleted || 0}</strong></p>
                <p>Streak: <strong>{currentUser?.streakDays || 0} d</strong></p>
                <p>Qur'an: <strong>{dashboard?.quranSlots || 0}</strong></p>
                <p>Dua slots: <strong>{dashboard?.duaSlots || 0}</strong></p>
              </div>
              
              <div className="flex flex-col gap-2 border-t pt-4 border-base-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Quick Actions</p>
                <div className="grid grid-cols-3 gap-2">
                  <Link to="/quran" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-9 px-1"><BookOpenText className="w-3 h-3 mr-1"/> Qur'an</Button>
                  </Link>
                  <Link to="/dua" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-9 px-1 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"><BellRing className="w-3 h-3 mr-1"/> Duas</Button>
                  </Link>
                  <Link to="/dhikr" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-9 px-1 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"><Fingerprint className="w-3 h-3 mr-1"/> Tasbih</Button>
                  </Link>
                </div>
              </div>

              {/* Phase 3-4 Quick Navigation */}
              <div className="flex flex-col gap-2 border-t pt-4 border-base-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Explore More</p>
                <div className="grid grid-cols-3 gap-2">
                  <Link to="/ai-coach" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-9 px-1 text-violet-600 border-violet-200 bg-violet-50 hover:bg-violet-100"><Bot className="w-3 h-3 mr-1"/> Coach</Button>
                  </Link>
                  <Link to="/ramadan-map" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-9 px-1 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"><Map className="w-3 h-3 mr-1"/> Map</Button>
                  </Link>
                  <Link to="/journal" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-9 px-1 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"><Sparkles className="w-3 h-3 mr-1"/> Journal</Button>
                  </Link>
                </div>
              </div>

              <Button className="w-full mt-2" onClick={handleCheckIn} disabled={!currentUserId}>Mark Today Complete</Button>
            </CardContent>
          </Card>
          </motion.div>


          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Leaderboard</CardTitle>
              <CardDescription>Consistency over volume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.slice(0, 6).map((item) => (
                <motion.div key={item.userId} className="flex items-center justify-between rounded-lg border border-base-300 px-3 py-2 text-sm" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <div>
                    <p className="font-medium text-base-content">#{item.rank} {item.name}</p>
                    <p className="text-xs text-base-content/70">{item.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base-content">{item.consistencyScore}</p>
                    <p className="text-xs text-base-content/70">{item.streakDays}d streak</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><BookOpenText className="h-4 w-4 text-primary" /> Nightly Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium text-base-content/85">{dashboard?.reflectionPrompt || "What tiny ibadah block worked best for you today?"}</p>
              
              <AnimatePresence mode="wait">
                {reflectionSaved ? (
                  <motion.div 
                    key="saved"
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 py-4 text-center"
                  >
                    <BookOpenText className="mb-2 h-6 w-6 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800">Saved to diary!</p>
                  </motion.div>
                ) : (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    <textarea 
                      className="w-full resize-none rounded-lg border border-base-300 bg-base-100 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={3}
                      placeholder="Write your thoughts..."
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                    />
                    <Button className="w-full" size="sm" onClick={handleSaveReflection} disabled={!currentUserId || !reflectionText.trim()}>Save Reflection</Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-700">
                <Flame className="h-4 w-4 shrink-0" /> Max notifications/day: 4-5.
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </aside>
      </main>
      </div>
    </div>
  );
}
