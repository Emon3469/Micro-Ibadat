import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchDashboard } from "../services/api";

const DAY_LABELS = Array.from({ length: 30 }, (_, i) => i + 1);

// Determine ibadah intensity from dashboard data per day
function getDayData(user, day) {
  const taraweeh = user?.taraweehDays?.find(t => t.day === day);
  if (!taraweeh) return { level: 0, label: "No data" };
  if (!taraweeh.logged) return { level: 0, label: "Not logged" };
  if (taraweeh.count >= 20) return { level: 4, label: "Full Taraweeh (20)" };
  if (taraweeh.count >= 8) return { level: 3, label: "Full Taraweeh (8)" };
  if (taraweeh.count >= 2) return { level: 2, label: "Partial Taraweeh" };
  return { level: 1, label: "Skipped" };
}

const INTENSITY_COLORS = [
  "bg-slate-100 border-slate-200",       // 0 - no data
  "bg-rose-200 border-rose-300",          // 1 - skipped
  "bg-indigo-200 border-indigo-300",      // 2 - partial
  "bg-indigo-400 border-indigo-500",      // 3 - full (8)
  "bg-indigo-700 border-indigo-800",      // 4 - full (20)
];

const IS_LAST_10 = (day) => day >= 21;
const IS_LAYLATUL_QADR = (day) => [21, 23, 25, 27, 29].includes(day);

export default function RamadanMap() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isQadrMode, setIsQadrMode] = useState(() => (localStorage.getItem("app_theme") || "ramadan") === "ramadan-night");

  useEffect(() => {
    const syncTheme = () => {
      const activeTheme = localStorage.getItem("app_theme") || "ramadan";
      setIsQadrMode(activeTheme === "ramadan-night");
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("app-theme-change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("app-theme-change", syncTheme);
    };
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    fetchDashboard(user._id).then(d => {
      setDashData(d);
    });
  }, [user]);

  const userData = dashData?.user;
  const totalLogged = userData?.taraweehDays?.filter(t => t.logged && t.count > 0).length || 0;
  const fullNights = userData?.taraweehDays?.filter(t => t.count >= 8).length || 0;

  const bgClass = isQadrMode
    ? "min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-950"
    : "min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50";

  const handleQadrModeToggle = () => {
    setIsQadrMode((previous) => {
      const next = !previous;
      const nextTheme = next ? "ramadan-night" : "ramadan";
      localStorage.setItem("app_theme", nextTheme);
      window.dispatchEvent(new Event("app-theme-change"));
      return next;
    });
  };

  return (
    <div className={`${bgClass} py-6 px-4 transition-colors duration-700`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isQadrMode ? "text-indigo-100" : "text-indigo-900"}`}>
                {isQadrMode ? "✨ Laylatul Qadr Mode" : "🗺️ 30-Day Ramadan Map"}
              </h1>
              <p className={`text-sm ${isQadrMode ? "text-indigo-300" : "text-indigo-600"}`}>
                Your Taraweeh heatmap — night by night
              </p>
            </div>
            <button
              onClick={handleQadrModeToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isQadrMode
                  ? "bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/40"
                  : "bg-indigo-100 border border-indigo-200 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              ⭐ Qadr Mode
            </button>
          </div>

          {/* Laylatul Qadr pinned banner */}
          {isQadrMode && (
            <Motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-indigo-500/40 bg-indigo-900/60 p-4 backdrop-blur"
            >
              <p className="text-indigo-200 text-sm font-semibold mb-1">⭐ Seek Laylatul Qadr in odd nights of the last 10</p>
              <p className="text-indigo-300/80 text-xs">
                "Seek Laylatul Qadr in the odd nights of the last ten nights of Ramadan." — al-Bukhari
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {[21, 23, 25, 27, 29].map(n => (
                  <span key={n} className="px-2 py-1 rounded-lg text-xs font-bold text-indigo-200 bg-indigo-500/30 border border-indigo-400/40">
                    Night {n}
                  </span>
                ))}
              </div>
            </Motion.div>
          )}
        </Motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Nights Logged", value: totalLogged, icon: "📋" },
            { label: "Full Nights", value: fullNights, icon: "🌙" },
            { label: "Remaining", value: Math.max(0, 30 - totalLogged), icon: "⏳" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-3 text-center shadow-sm ${
              isQadrMode ? "bg-slate-800/80 border border-slate-700" : "bg-white border border-indigo-100"
            }`}>
              <p className="text-xl">{s.icon}</p>
              <p className={`text-xl font-black ${isQadrMode ? "text-indigo-200" : "text-indigo-800"}`}>{s.value}</p>
              <p className={`text-xs ${isQadrMode ? "text-slate-400" : "text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className={`rounded-2xl p-5 shadow-sm ${
          isQadrMode ? "bg-slate-900/70 border border-slate-700" : "bg-white border border-indigo-100"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm font-semibold ${isQadrMode ? "text-indigo-200" : "text-indigo-800"}`}>Taraweeh Heatmap</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Less</span>
              {INTENSITY_COLORS.map((cls, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-sm border ${cls}`} />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15">
            {DAY_LABELS.map(day => {
              const { level } = getDayData(userData, day);
              const isQadr = IS_LAYLATUL_QADR(day);
              const isLast10 = IS_LAST_10(day);
              const colorClass = INTENSITY_COLORS[level];

              return (
                <Motion.button
                  key={day}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`relative h-8 w-8 sm:h-7 sm:w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${colorClass} ${
                    isQadr && isQadrMode ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900" : ""
                  } ${isLast10 && !isQadrMode ? "ring-1 ring-indigo-300" : ""} ${
                    day === selectedDay ? "scale-110 shadow-lg" : ""
                  }`}
                >
                  <span className={`text-[10px] font-bold ${level > 2 ? "text-white" : isQadrMode ? "text-slate-400" : "text-indigo-500"}`}>
                    {day}
                  </span>
                  {isQadr && <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>}
                </Motion.button>
              );
            })}
          </div>

          {/* Selected day info */}
          {selectedDay && (
            <Motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-xl p-3 text-sm ${
                isQadrMode ? "bg-slate-800 border border-slate-600 text-slate-200" : "bg-indigo-50 border border-indigo-200 text-indigo-800"
              }`}
            >
              <p className="font-semibold">Night {selectedDay} {IS_LAYLATUL_QADR(selectedDay) ? "⭐" : ""}</p>
              <p className="text-xs opacity-70 mt-0.5">{getDayData(userData, selectedDay).label}</p>
              {IS_LAYLATUL_QADR(selectedDay) && (
                <p className="text-xs mt-1 text-yellow-600 font-medium">Potential Laylatul Qadr — worth 1,000 months of worship!</p>
              )}
            </Motion.div>
          )}
        </div>

        {/* Legend */}
        <div className={`rounded-xl p-4 text-xs space-y-1.5 ${
          isQadrMode ? "bg-slate-900/50 border border-slate-700 text-slate-300" : "bg-indigo-50 border border-indigo-100 text-indigo-700"
        }`}>
          <p className="font-semibold mb-2">Legend</p>
          {[
            ["", "Not logged yet"],
            ["🔴", "Skipped"],
            ["🔵", "Partial Taraweeh"],
            ["💙", "Full (8 rakaat)"],
            ["🟣", "Full (20 rakaat)"],
          ].map(([icon, text]) => (
            <p key={text}>{icon || "⬜"} {text}</p>
          ))}
          {!isQadrMode && <p className="pt-1 opacity-60">🔲 Highlighted = Last 10 nights · ⭐ = Odd night (possible Laylatul Qadr)</p>}
        </div>
      </div>
    </div>
  );
}
