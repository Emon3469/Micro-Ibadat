import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, Calculator, Target, TrendingUp, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { fetchQuranPlan, fetchQuranTracker, logQuranReading } from "../services/api";
import { useAuth } from "../context/AuthContext";

const PRESETS = [
  { ayahsPerRead: 5, timesPerDay: 5, label: "Gentle Start" },
  { ayahsPerRead: 10, timesPerDay: 3, label: "Balanced" },
  { ayahsPerRead: 15, timesPerDay: 3, label: "Consistent" },
  { ayahsPerRead: 20, timesPerDay: 2, label: "Deep Focus" },
  { ayahsPerRead: 25, timesPerDay: 2, label: "Ambitious" },
  { ayahsPerRead: 40, timesPerDay: 2, label: "Power Reader" },
];

const SURAHS = [
  { number: 1, name: "Al-Fatiha", ayahs: 7 },
  { number: 2, name: "Al-Baqarah", ayahs: 286 },
  { number: 36, name: "Ya-Sin", ayahs: 83 },
  { number: 55, name: "Ar-Rahman", ayahs: 78 },
  { number: 56, name: "Al-Waqi'ah", ayahs: 96 },
  { number: 67, name: "Al-Mulk", ayahs: 30 },
  { number: 112, name: "Al-Ikhlas", ayahs: 4 },
];

export default function Quran() {
  const { user } = useAuth();
  const [input, setInput] = useState({ ayahsPerRead: 10, timesPerDay: 3 });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [manualAyahs, setManualAyahs] = useState(5);
  const [trackerRows, setTrackerRows] = useState([]);
  const [overallTotal, setOverallTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [justLogged, setJustLogged] = useState(false);

  const refreshTracker = useCallback(async () => {
    if (!user?._id) return;
    const data = await fetchQuranTracker(user._id);
    setTrackerRows(data.entries || []);
    setTodayTotal(data.todayTotal || 0);
    setOverallTotal(data.overallTotal || 0);
  }, [user?._id]);

  useEffect(() => {
    refreshTracker().catch(() => {});
  }, [refreshTracker]);

  const handleCalculate = async (preset) => {
    const payload = preset || input;
    setInput(payload);
    setLoading(true);
    try {
      const result = await fetchQuranPlan(payload);
      setPlan(result);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async () => {
    if (!selectedSurah) return;
    if (!user?._id) return;
    await logQuranReading(user._id, {
      surahNumber: selectedSurah.number,
      surahName: selectedSurah.name,
      ayahsRead: manualAyahs,
    });
    await refreshTracker();
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-50 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-100">
              <BookOpen className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Qur'an Hub</h1>
              <p className="text-sm text-emerald-600">Calculator & Daily Tracker</p>
            </div>
          </div>

          {/* Today's stat strip */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 rounded-xl bg-emerald-600 text-white p-3 text-center shadow-sm">
              <p className="text-2xl font-black">{todayTotal}</p>
              <p className="text-xs opacity-80 font-medium">Ayahs today</p>
            </div>
            <div className="flex-1 rounded-xl bg-white border border-emerald-200 p-3 text-center shadow-sm">
              <p className="text-2xl font-black text-emerald-700">{plan?.daysToCompletion || "—"}</p>
              <p className="text-xs text-emerald-500 font-medium">Days to finish</p>
            </div>
            <div className="flex-1 rounded-xl bg-white border border-emerald-200 p-3 text-center shadow-sm">
              <p className="text-2xl font-black text-emerald-700">{overallTotal || "—"}</p>
              <p className="text-xs text-emerald-500 font-medium">Total logged</p>
            </div>
          </div>
        </Motion.div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-emerald-100 rounded-xl">
          {[{ id: "calculator", label: "📐 Calculator" }, { id: "tracker", label: "✅ Tracker" }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-emerald-600 hover:text-emerald-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "calculator" && (
            <Motion.div key="calc" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <Calculator className="w-4 h-4" /> Reading Pace Calculator
                  </CardTitle>
                  <CardDescription>Pick a preset or enter your own reading pace to get a personalized plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESETS.map((preset) => (
                      <Motion.button
                        key={preset.label}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleCalculate(preset)}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-3 text-left transition-colors"
                      >
                        <p className="text-xs font-bold text-emerald-800">{preset.label}</p>
                        <p className="text-xs text-emerald-600 mt-0.5">{preset.ayahsPerRead} ayahs × {preset.timesPerDay}/day</p>
                      </Motion.button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <div className="flex gap-2 pt-2 border-t border-emerald-100">
                    <div className="flex-1">
                      <label className="text-xs text-emerald-700 font-medium">Ayahs per reading</label>
                      <Input type="number" min={1} value={input.ayahsPerRead} onChange={e => setInput(p => ({ ...p, ayahsPerRead: Number(e.target.value) }))} className="mt-1" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-emerald-700 font-medium">Times per day</label>
                      <Input type="number" min={1} value={input.timesPerDay} onChange={e => setInput(p => ({ ...p, timesPerDay: Number(e.target.value) }))} className="mt-1" />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => handleCalculate()} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {loading ? "..." : "Go"}
                      </Button>
                    </div>
                  </div>

                  {/* Results */}
                  <AnimatePresence>
                    {plan && (
                      <Motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50 p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-black text-emerald-800">{plan.totalAyahsPerDay} ayahs/day</p>
                            <p className="text-sm text-emerald-600">{plan.paceText}</p>
                          </div>
                          <Badge className="bg-emerald-600 text-white">{plan.daysToCompletion} days</Badge>
                        </div>
                        <Progress value={Math.min(100, (plan.totalAyahsPerDay / 100) * 100)} className="h-2 bg-emerald-100" />
                        <p className="text-xs text-emerald-700 bg-white/60 rounded-lg p-2">
                          💡 At this pace you'll complete the Quran in <strong>{plan.daysToCompletion} days</strong>. {plan.daysToCompletion <= 30 ? "✨ Khatam before Eid!" : "Keep going — every ayah counts!"}
                        </p>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </Motion.div>
          )}

          {activeTab === "tracker" && (
            <Motion.div key="track" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <Target className="w-4 h-4" /> Log Today's Reading
                  </CardTitle>
                  <CardDescription>Select a Surah and log the ayahs you read today.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {SURAHS.map(surah => (
                      <Motion.button
                        key={surah.number}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSurah(surah)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                          selectedSurah?.number === surah.number
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300 shadow-sm"
                            : "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/70 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-100 px-2 text-[11px] font-bold text-emerald-700">
                            {surah.number}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-emerald-900">{surah.name}</p>
                            <p className="text-xs text-emerald-600">{surah.ayahs} ayahs</p>
                          </div>
                        </div>
                        {selectedSurah?.number === surah.number && <Check className="w-4 h-4 text-emerald-600" />}
                      </Motion.button>
                    ))}
                  </div>

                  {selectedSurah && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t pt-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Ayahs read in {selectedSurah.name}</label>
                        <div className="flex gap-2 mt-1">
                          {[5, 10, 15, 20, selectedSurah.ayahs].map(n => (
                            <button
                              key={n}
                              onClick={() => setManualAyahs(n)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                manualAyahs === n ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                              }`}
                            >
                              {n === selectedSurah.ayahs ? "Full" : n}
                            </button>
                          ))}
                          <Input type="number" min={1} value={manualAyahs} onChange={e => setManualAyahs(Number(e.target.value))} className="w-20" />
                        </div>
                      </div>

                      <AnimatePresence>
                        {justLogged ? (
                          <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 text-emerald-800">
                            <Check className="w-5 h-5 text-emerald-600" />
                            <p className="font-medium text-sm">Logged! +{manualAyahs} ayahs. Keep going! 📖</p>
                          </Motion.div>
                        ) : (
                          <Button onClick={handleLog} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            Log {manualAyahs} Ayahs of {selectedSurah.name}
                          </Button>
                        )}
                      </AnimatePresence>
                    </Motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Reading history */}
              {trackerRows.length > 0 && (
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-emerald-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {trackerRows.slice().sort((a, b) => b.ayahsRead - a.ayahsRead).map((entry, index) => {
                        const surah = SURAHS.find(s => s.number === Number(entry.surahNumber));
                        const key = `${entry.dateKey}_${entry.surahNumber}_${index}`;
                        return (
                          <div key={key} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-0">
                            <span className="text-gray-600">{surah?.name || entry.surahName || `Surah ${entry.surahNumber}`} <span className="text-gray-400 text-xs">({entry.dateKey})</span></span>
                            <Badge variant="secondary" className="text-emerald-700 bg-emerald-50">{entry.ayahsRead} ayahs</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
