import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Users, Zap, Trophy, ChevronRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { fetchChallenges, createChallenge, joinChallenge, updateChallengeProgress, fetchUserGroups } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CHALLENGE_TYPES = [
  { id: "quran", label: "📖 Quran", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "dhikr", label: "📿 Dhikr", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { id: "salah", label: "🕌 Salah", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "fast", label: "🌙 Fast", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  { id: "custom", label: "✨ Custom", color: "text-amber-700 bg-amber-50 border-amber-200" },
];

function ChallengeCard({ challenge, userId, onUpdate }) {
  const participant = challenge.participants?.find(p =>
    p.userId?._id === userId || p.userId === userId
  );
  const isJoined = !!participant;
  const pct = Math.min(100, Math.round(((participant?.progress || 0) / challenge.goal) * 100));
  const typeStyle = CHALLENGE_TYPES.find(t => t.id === challenge.type)?.color || "";
  const [updating, setUpdating] = useState(false);

  const handleJoin = async () => {
    await joinChallenge(challenge._id, userId);
    onUpdate();
  };

  const handleProgress = async () => {
    setUpdating(true);
    try {
      await updateChallengeProgress(challenge._id, userId, 1);
      onUpdate();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Motion.div whileHover={{ y: -2 }} className={`rounded-xl border p-4 shadow-sm bg-white ${participant?.completed ? "border-green-200" : "border-gray-200"}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeStyle}`}>
              {CHALLENGE_TYPES.find(t => t.id === challenge.type)?.label}
            </span>
            {participant?.completed && <Badge className="bg-green-100 text-green-700 text-xs">Completed ✓</Badge>}
          </div>
          <h3 className="font-bold text-gray-900">{challenge.title}</h3>
          {challenge.description && <p className="text-xs text-gray-500 mt-0.5">{challenge.description}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-amber-600">+{challenge.hasanatReward}</p>
          <p className="text-[10px] text-gray-400">Hasanat</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{participant?.progress || 0} / {challenge.goal} {challenge.unit || "count"}</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="w-3 h-3" />
          <span>{challenge.participants?.length || 0} joined</span>
        </div>
        {!isJoined ? (
          <Button size="sm" onClick={handleJoin} className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700 text-white">
            Join
          </Button>
        ) : participant?.completed ? (
          <span className="text-xs text-green-600 font-medium">🎉 Done!</span>
        ) : (
          <Button size="sm" onClick={handleProgress} disabled={updating} className="text-xs h-7">
            +1 Progress
          </Button>
        )}
      </div>
    </Motion.div>
  );
}

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "", description: "", type: "quran", goal: 100, unit: "ayahs",
    hasanatReward: 200, groupId: "",
  });

  const loadChallenges = async () => {
    const data = await fetchChallenges();
    setChallenges(data);
  };

  useEffect(() => {
    Promise.all([
      loadChallenges(),
      user?._id ? fetchUserGroups(user._id).then(setGroups) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    if (!form.title) return;
    setCreating(true);
    try {
      await createChallenge({ ...form, createdBy: user?._id });
      setShowCreate(false);
      setForm({ title: "", description: "", type: "quran", goal: 100, unit: "ayahs", hasanatReward: 200, groupId: "" });
      await loadChallenges();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100">
                <Trophy className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">Squad Challenges</h1>
                <p className="text-sm text-amber-600">Group goal tracking & competition</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Create
            </Button>
          </div>
        </Motion.div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-800 text-sm">Create a New Challenge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Challenge title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Type</label>
                      <select className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                        {CHALLENGE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Group</label>
                      <select className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.groupId} onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))}>
                        <option value="">Public</option>
                        {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Goal</label>
                      <Input type="number" min={1} value={form.goal} onChange={e => setForm(p => ({ ...p, goal: Number(e.target.value) }))} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Unit</label>
                      <Input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium">Reward ⭐</label>
                      <Input type="number" value={form.hasanatReward} onChange={e => setForm(p => ({ ...p, hasanatReward: Number(e.target.value) }))} className="mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={handleCreate} disabled={creating || !form.title} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
                      {creating ? "Creating..." : "Create Challenge"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Challenges list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-16 text-amber-700">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No active challenges yet.</p>
            <p className="text-sm opacity-70">Create one and rally your squad!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map(ch => (
              <ChallengeCard key={ch._id} challenge={ch} userId={user?._id} onUpdate={loadChallenges} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
