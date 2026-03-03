import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Settings, Save, Radio, Clock, Users, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { fetchAdminSettings, updateAdminSettings, fetchLeaderboard } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Admin check
    if (user && user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    Promise.all([fetchAdminSettings(), fetchLeaderboard()])
      .then(([sett, lb]) => {
        setSettings(sett);
        setLeaderboard(lb);
      })
      .finally(() => setLoading(false));
  }, [navigate, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSalah = (prayer, value) => {
    setSettings(prev => ({
      ...prev,
      salahTimes: { ...prev.salahTimes, [prayer]: value },
    }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 to-gray-100">
      <div className="w-10 h-10 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!settings) return null;

  const SALAH_ORDER = ["fajr", "suhoor", "dhuhr", "asr", "maghrib", "iftar", "isha"];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-gray-100 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-slate-200">
              <Settings className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-sm text-slate-600">Salah times, broadcasts & user management</p>
            </div>
            <Badge className="ml-auto bg-slate-700 text-white">Admin Only</Badge>
          </div>
        </Motion.div>

        {/* Salah Times */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Clock className="w-4 h-4" /> Salah & Prayer Times
            </CardTitle>
            <CardDescription>These times are shown to all students in their Profile settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {SALAH_ORDER.map(prayer => (
                <div key={prayer}>
                  <label className="text-xs font-semibold text-slate-600 capitalize">{prayer === "suhoor" ? "Suhoor (pre-Fajr)" : prayer === "iftar" ? "Iftar (Maghrib)" : prayer}</label>
                  <Input
                    type="time"
                    value={settings.salahTimes?.[prayer] || ""}
                    onChange={e => updateSalah(prayer, e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <p>💡 Suhoor/Iftar countdowns will appear on the dashboard based on these times.</p>
            </div>
          </CardContent>
        </Card>

        {/* Broadcast Message */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Radio className="w-4 h-4" /> Broadcast Announcement
            </CardTitle>
            <CardDescription>A pinned message shown to all students on their Profile page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={settings.broadcastMessage || ""}
              onChange={e => setSettings(prev => ({ ...prev, broadcastMessage: e.target.value }))}
              placeholder="Write an announcement... (e.g. 'Ramadan Mubarak! Please check in daily for your Hasanat points.')"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-gray-700 focus:border-slate-400 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 font-medium">Expires</label>
              <Input
                type="datetime-local"
                value={settings.broadcastExpiry ? new Date(settings.broadcastExpiry).toISOString().slice(0, 16) : ""}
                onChange={e => setSettings(prev => ({ ...prev, broadcastExpiry: e.target.value }))}
                className="flex-1 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard overview */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="w-4 h-4" /> Active Users
            </CardTitle>
            <CardDescription>Top students by consistency score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.slice(0, 8).map(item => (
                <div key={item.userId} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">#{item.rank} {item.name}</p>
                    <p className="text-xs text-slate-500">{item.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700">{item.consistencyScore}</p>
                    <p className="text-xs text-slate-400">{item.streakDays}d streak</p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No students registered yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="pb-4">
          <AnimatePresence>
            {saved && (
              <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-medium">
                ✅ Settings saved successfully!
              </Motion.div>
            )}
          </AnimatePresence>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
