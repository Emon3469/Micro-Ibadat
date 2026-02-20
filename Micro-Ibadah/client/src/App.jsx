import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, BookOpenText, Clock3, Flame, Trophy } from "lucide-react";
import { createStudent, fetchDashboard, fetchDuas, fetchLeaderboard, fetchQuranPlan, saveRoutine, submitCheckIn } from "./services/api";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";

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

function App() {
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

  const quranProgress = useMemo(() => {
    if (!quranPlan?.totalAyahsPerDay) return 0;
    return Math.min(100, Math.round((quranPlan.totalAyahsPerDay / 60) * 100));
  }, [quranPlan]);

  useEffect(() => {
    const loadStatic = async () => {
      const [duaRes, leaderboardRes] = await Promise.all([fetchDuas(), fetchLeaderboard()]);
      setDuas(duaRes);
      setLeaderboard(leaderboardRes);
    };
    loadStatic();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const user = await createStudent(student);
      setCurrentUser(user);
      const dashboardData = await fetchDashboard(user._id);
      setDashboard(dashboardData);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutineSave = async () => {
    if (!currentUser) return;
    await saveRoutine(currentUser._id, slots);
    const dashboardData = await fetchDashboard(currentUser._id);
    setDashboard(dashboardData);
  };

  const handleQuranCalc = async (preset = null) => {
    const payload = preset || quranInput;
    setQuranInput(payload);
    const result = await fetchQuranPlan(payload);
    setQuranPlan(result);
  };

  const handleCheckIn = async () => {
    if (!currentUser) return;
    const user = await submitCheckIn(currentUser._id);
    setCurrentUser(user);
    const [dashboardData, leaderboardRes] = await Promise.all([
      fetchDashboard(currentUser._id),
      fetchLeaderboard(),
    ]);
    setDashboard(dashboardData);
    setLeaderboard(leaderboardRes);
  };

  return (
    <div data-theme="ramadan" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 rounded-2xl border border-base-300 bg-base-100/90 p-6 shadow-sm backdrop-blur-sm"
      >
        <Badge className="mb-3">Ramadan MVP</Badge>
        <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-4xl">Micro-Ibadah</h1>
        <p className="mt-2 text-sm text-base-content/75 sm:text-base">Busy schedule. Small deeds. Big consistency.</p>
      </motion.header>

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
                <Button onClick={handleRoutineSave} disabled={!currentUser}>Save Routine</Button>
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
                <Input type="number" min={1} value={quranInput.ayahsPerRead} onChange={(event) => setQuranInput((prev) => ({ ...prev, ayahsPerRead: Number(event.target.value) }))} />
                <Input type="number" min={1} value={quranInput.timesPerDay} onChange={(event) => setQuranInput((prev) => ({ ...prev, timesPerDay: Number(event.target.value) }))} />
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
        </section>

        <aside className="space-y-4">
          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Today's Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Completed micro-ibadah: <strong>{dashboard?.todayCompleted || 0}</strong></p>
              <p>Qur'an slots: <strong>{dashboard?.quranSlots || 0}</strong></p>
              <p>Dua slots: <strong>{dashboard?.duaSlots || 0}</strong></p>
              <p>Streak: <strong>{currentUser?.streakDays || 0} day(s)</strong></p>
              <Button className="w-full" onClick={handleCheckIn} disabled={!currentUser}>Mark Today Complete</Button>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.4 }}><BellRing className="h-4 w-4" /></motion.span> Smart Dua Reminders</CardTitle>
              <CardDescription>One-tap read. No long essays.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {duas.slice(0, 4).map((dua) => (
                <motion.div key={dua.id} className="rounded-lg border border-base-300 bg-base-200/50 p-3" whileHover={{ scale: 1.01 }}>
                  <p className="text-xs font-semibold text-base-content/70">{dua.category}</p>
                  <p className="mt-1 text-sm font-medium text-base-content">{dua.arabic}</p>
                  <p className="mt-1 text-xs text-base-content/80">{dua.meaning}</p>
                </motion.div>
              ))}
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
          <Card className="border-base-300 bg-base-100/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpenText className="h-4 w-4" /> Reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-base-content/85">{dashboard?.reflectionPrompt || "What tiny ibadah block worked best for you today?"}</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-2 text-xs text-orange-700">
                <Flame className="h-4 w-4" /> Max notifications/day: 4-5 for healthy consistency.
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </aside>
      </main>
    </div>
  );
}

export default App;
