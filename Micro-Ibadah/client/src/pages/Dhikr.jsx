import { useState, useEffect, useCallback, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Fingerprint, RotateCcw, Smartphone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateTasbih } from "../services/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const SHAKE_THRESHOLD = 15;
const SHAKE_COOLDOWN = 350;
const DHIKR_SUGGESTIONS = ["SubhanAllah", "Alhamdulillah", "Allahu Akbar", "Astaghfirullah", "La ilaha illallah"];

export default function Dhikr() {
  const { user, setUser } = useAuth();
  const [sessionCount, setSessionCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [shakePermission, setShakePermission] = useState("unknown");
  const [lastShake, setLastShake] = useState(0);
  const [justShook, setJustShook] = useState(false);
  const sessionCountRef = useRef(sessionCount);

  const [currentDhikr, setCurrentDhikr] = useState(DHIKR_SUGGESTIONS[0]);

  useEffect(() => { sessionCountRef.current = sessionCount; }, [sessionCount]);

  const handleSaveImmediate = useCallback(async (countToSave) => {
    if (countToSave === 0 || !user || isSaving) return;
    setIsSaving(true);
    try {
      const { tasbihCount, hasanatPoints } = await updateTasbih(user._id || user.id, countToSave);
      setUser(prev => ({ ...prev, tasbihCount, hasanatPoints }));
      setSessionCount(0);
      sessionCountRef.current = 0;
      setCurrentDhikr(prev => {
        const idx = DHIKR_SUGGESTIONS.indexOf(prev);
        return DHIKR_SUGGESTIONS[(idx + 1) % DHIKR_SUGGESTIONS.length];
      });
    } catch (error) {
      console.error("Failed to save dhikr", error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, setUser, user]);

  const increment = useCallback(() => {
    setSessionCount(prev => {
      const n = prev + 1;
      if (n === 33 || n === 99) handleSaveImmediate(n);
      return n;
    });
  }, [handleSaveImmediate]);

  const handleMotion = useCallback((event) => {
    const { acceleration } = event;
    if (!acceleration) return;
    const { x, y, z } = acceleration;
    const magnitude = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);
    const now = Date.now();
    if (magnitude > SHAKE_THRESHOLD && now - lastShake > SHAKE_COOLDOWN) {
      setLastShake(now);
      setJustShook(true);
      setTimeout(() => setJustShook(false), 150);
      increment();
    }
  }, [lastShake, increment]);

  useEffect(() => {
    if (!shakeEnabled) {
      window.removeEventListener("devicemotion", handleMotion);
      return;
    }
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [shakeEnabled, handleMotion]);

  const enableShake = async () => {
    if (typeof DeviceMotionEvent === "undefined") {
      alert("Device motion not supported.");
      return;
    }
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm === "granted") { setShakePermission("granted"); setShakeEnabled(true); }
        else setShakePermission("denied");
      } catch { setShakePermission("denied"); }
    } else {
      setShakePermission("granted");
      setShakeEnabled(true);
    }
  };

  const handleTap = () => increment();
  const ringProgress = Math.min(100, ((sessionCount % 33) / 33) * 100);

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <Card className={`border-emerald-200 shadow-lg relative overflow-hidden transition-colors duration-200 ${justShook ? "bg-emerald-100" : "bg-emerald-50"}`}>
        <Motion.div key={sessionCount} initial={{ scale: 0.8, opacity: 0.2 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-emerald-400 rounded-full pointer-events-none origin-center m-auto w-32 h-32" />

        <CardHeader className="text-center pb-2 relative z-10">
          <CardTitle className="flex justify-center items-center gap-2 text-emerald-800 text-2xl">
            <Fingerprint className="h-6 w-6" /> Digital Tasbih
          </CardTitle>
          <CardDescription className="text-emerald-700 font-medium mt-1">
            Focus: <span className="text-emerald-900 font-bold">{currentDhikr}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 relative z-10 pt-4">
          {/* Circular ring progress button */}
          <div className="relative w-48 h-48">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#d1fae5" strokeWidth="8" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="#059669" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - ringProgress / 100)}`}
                strokeLinecap="round" className="transition-all duration-200" />
            </svg>
            <Motion.button whileTap={{ scale: 0.92 }} onClick={handleTap}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-6xl font-black text-white shadow-2xl focus:outline-none">
              {sessionCount}
            </Motion.button>
          </div>

          {/* Shake toggle */}
          <div className="w-full flex items-center gap-3 py-2 px-4 rounded-xl bg-white/60 border border-emerald-200">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium flex-1">Shake to Count</span>
            <AnimatePresence>
              {justShook && (
                <Motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs text-emerald-600 font-bold">Shake! 📿</Motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => shakeEnabled ? setShakeEnabled(false) : enableShake()}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${shakeEnabled
                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300"
                : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"}`}
            >
              {shakePermission === "denied" ? "Denied" : shakeEnabled ? "ON" : "Enable"}
            </button>
          </div>

          <div className="flex w-full items-center justify-between px-4">
            <div className="flex flex-col">
              <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Total Tasbih</span>
              <span className="text-2xl font-bold text-emerald-800">{user?.tasbihCount || 0}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setSessionCount(0)}
                className="text-emerald-700 border-emerald-200 bg-emerald-100 hover:bg-emerald-200"
                disabled={sessionCount === 0 || isSaving}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={() => handleSaveImmediate(sessionCount)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-20"
                disabled={sessionCount === 0 || isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 text-center text-sm text-slate-500">
        📿 Auto-saves at 33 & 99 · Shake your phone to count hands-free · +15–50 Hasanat per set
      </div>
    </div>
  );
}
