import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { BookHeart, Send, Smile, Meh, Frown, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { fetchJournalPrompt, fetchJournalEntries, saveJournalEntry } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MOODS = [
  { id: "grateful", label: "Grateful 🤲", icon: Smile, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "reflective", label: "Reflective 🌙", icon: Meh, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "struggling", label: "Struggling 😔", icon: Frown, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { id: "inspired", label: "Inspired ✨", icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-200" },
];

function MoodButton({ mood, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(mood.id)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
        selected === mood.id
          ? mood.color + " ring-2 ring-current shadow-sm scale-[1.02]"
          : "bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50/50"
      }`}
    >
      {mood.label}
    </button>
  );
}

export default function Journal() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("reflective");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEntries, setShowEntries] = useState(false);
  const [ramadanDay, setRamadanDay] = useState(Math.min(30, new Date().getDate()));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [promptData, entriesData] = await Promise.all([
          fetchJournalPrompt(ramadanDay),
          user?._id ? fetchJournalEntries(user._id) : Promise.resolve([]),
        ]);
        setPrompt(promptData.prompt);
        setEntries(entriesData || []);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, ramadanDay]);

  const handleSave = async () => {
    if (!text.trim() || !user?._id) return;
    setSaving(true);
    try {
      const data = await saveJournalEntry(user._id, { prompt, text, mood });
      setEntries(data.journalEntries || []);
      setText("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getNewPrompt = () => {
    const nextDay = ramadanDay < 30 ? ramadanDay + 1 : 1;
    setRamadanDay(nextDay);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-50">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100">
              <BookHeart className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Nightly Journal</h1>
              <p className="text-sm text-amber-600">Rotating AI-inspired reflections · Night {ramadanDay}</p>
            </div>
          </div>
        </Motion.div>

        {/* Tonight's Prompt */}
        <Motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-amber-300 bg-linear-to-br from-amber-50 to-orange-50 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-800 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Tonight's Reflection
                </CardTitle>
                <button
                  onClick={getNewPrompt}
                  className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  ↻ New prompt
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <Motion.p
                  key={prompt}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-amber-900 font-medium text-base leading-relaxed"
                >
                  "{prompt}"
                </Motion.p>
              </AnimatePresence>
            </CardContent>
          </Card>
        </Motion.div>

        {/* Write Entry */}
        <Card className="border-amber-200">
          <CardContent className="pt-5 space-y-4">
            {/* Mood selector */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">How are you feeling tonight?</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <MoodButton key={m.id} mood={m} selected={mood} onClick={setMood} />
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write your reflection... Be honest, be real. This is just for you."
                rows={5}
                className="w-full resize-none rounded-xl border border-amber-200 bg-amber-50/30 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-400">{text.length} chars</p>
                <p className="text-xs text-gray-400">+20 Hasanat ⭐ for writing</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {saved ? (
                <Motion.div key="saved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800">
                  <BookHeart className="w-4 h-4" />
                  <p className="text-sm font-medium">Saved to your journal! +20 Hasanat ⭐</p>
                </Motion.div>
              ) : (
                <Button
                  key="btn"
                  onClick={handleSave}
                  disabled={!text.trim() || saving || !user?._id}
                  className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-sm"
                >
                  {saving ? "Saving..." : <><Send className="w-4 h-4 mr-2" /> Send Tonight's Entry</>}
                </Button>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Past entries */}
        {entries.length > 0 && (
          <div>
            <button
              onClick={() => setShowEntries(!showEntries)}
              className="w-full flex items-center justify-between text-sm font-semibold text-amber-800 bg-amber-50 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <span>📚 Past Entries ({entries.length})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showEntries ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showEntries && (
                <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="space-y-3 mt-3">
                    {entries.slice(0, 10).map((entry, i) => (
                      <div key={i} className="rounded-xl bg-white border border-amber-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                          <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">{entry.mood}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 italic mb-2">"{entry.prompt}"</p>
                        <p className="text-sm text-gray-800">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
