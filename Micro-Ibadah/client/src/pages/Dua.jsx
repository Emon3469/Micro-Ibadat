import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { BookOpenText, BellRing, Bookmark, Search, Send, Heart } from "lucide-react";
import { fetchDuas, fetchDuaBoard, postDuaBoard, sayAmeen } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

const DUA_CATEGORIES = [
  "general", "healing", "guidance", "protection", "gratitude", "study", "family"
];

function CommunityDuaBoard({ userId }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ameenedIds, setAmeenedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ameened_duas") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    fetchDuaBoard().then(setPosts).finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!text.trim() || text.trim().length < 5) return;
    setSubmitting(true);
    try {
      const newPost = await postDuaBoard(text.trim(), category);
      setPosts(prev => [newPost, ...prev]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmeen = async (postId) => {
    if (ameenedIds.includes(postId)) return;
    const updated = [...ameenedIds, postId];
    setAmeenedIds(updated);
    localStorage.setItem("ameened_duas", JSON.stringify(updated));
    const { ameen } = await sayAmeen(postId, userId);
    setPosts(prev => prev.map(p => p._id === postId ? { ...p, ameen } : p));
  };

  const timeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-800">
          <BellRing className="w-5 h-5" /> 🤲 Community Dua Board
        </CardTitle>
        <CardDescription>Anonymous dua requests · Disappear after 24 hours · Say Ameen anonymously</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Post form */}
        <div className="space-y-2 rounded-xl bg-white p-4 border border-indigo-100">
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, 280))}
            placeholder="Share an anonymous dua request... (e.g. 'Please make dua for my exam results')"
            rows={2}
            className="w-full resize-none rounded-lg border border-indigo-200 bg-indigo-50/30 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <select className="flex-1 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm bg-white text-gray-600"
              value={category} onChange={e => setCategory(e.target.value)}>
              {DUA_CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <Button onClick={handlePost} disabled={submitting || text.trim().length < 5}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0" size="sm">
              <Send className="w-3.5 h-3.5 mr-1" />
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
          <p className="text-[10px] text-gray-400">{text.length}/280 · Posted anonymously · expires in 24h</p>
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="text-center py-6 text-indigo-400">Loading community duas...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-6 text-indigo-400 text-sm">
            No active dua requests. Be the first to share! 🤲
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <Motion.div key={post._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white border border-indigo-100 p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">{post.category}</span>
                      <span className="text-[10px] text-gray-400">• expires {timeLeft(post.expiresAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{post.text}</p>
                  </div>
                  <button
                    onClick={() => handleAmeen(post._id)}
                    disabled={ameenedIds.includes(post._id)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all shrink-0 ${
                      ameenedIds.includes(post._id)
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${ameenedIds.includes(post._id) ? "fill-indigo-400" : ""}`} />
                    <span className="text-[10px] font-bold">{post.ameen}</span>
                  </button>
                </div>
              </Motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dua() {
  const { user } = useAuth();
  const [duas, setDuas] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuas()
      .then((data) => {
        const normalized = (Array.isArray(data) ? data : []).map((dua, index) => {
          const fallbackTitle = dua?.category || `Dua ${index + 1}`;
          return {
            ...dua,
            id: dua?.id || dua?._id || `dua-${index}`,
            title: dua?.title || fallbackTitle,
            category: dua?.category || "General",
            meaning: dua?.meaning || "",
            arabic: dua?.arabic || "",
          };
        });
        setDuas(normalized);
      })
      .catch(() => {
        setDuas([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const emotionCategories = useMemo(() => ["All", ...new Set(duas.map(d => d.category))], [duas]);
  const filteredDuas = useMemo(() => {
    return duas.filter(d => {
      const matchesEmotion = selectedEmotion === "All" || d.category === selectedEmotion;
      const query = searchQuery.toLowerCase();
      const title = (d.title || "").toLowerCase();
      const meaning = (d.meaning || "").toLowerCase();
      const matchesSearch = title.includes(query) || meaning.includes(query);
      return matchesEmotion && matchesSearch;
    });
  }, [duas, selectedEmotion, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex justify-center items-center gap-2 text-slate-800">
          <BookOpenText className="text-primary w-8 h-8" /> Dua Library
        </h1>
        <p className="text-slate-600 mt-2">Find the right words when you need them most.</p>
      </div>

      <div className="flex flex-col gap-4 sticky top-0 bg-base-50/90 backdrop-blur-md z-10 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input className="pl-10 h-12 bg-white rounded-xl shadow-sm border-slate-200"
            placeholder="Search duas by meaning or title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {emotionCategories.map(cat => (
            <Button key={cat} variant="outline"
              className={`shrink-0 rounded-full font-semibold transition-all ${selectedEmotion === cat
                ? "bg-primary text-primary-content border-primary shadow-md hover:bg-primary/90"
                : "bg-base-100 text-base-content/80 border-base-300 hover:border-primary/40 hover:text-primary hover:bg-primary/5"}`}
              onClick={() => setSelectedEmotion(cat)}>
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-slate-400">Loading Duas...</div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDuas.map((dua) => (
              <Motion.div key={dua.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Card className="group h-full border border-base-300/80 bg-base-100 hover:border-primary/30 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <div>
                      <p className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">{dua.category}</p>
                      <CardTitle className="text-lg leading-tight text-base-content group-hover:text-primary transition-colors">{dua.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="text-base-content/40 hover:text-amber-500 hover:bg-amber-50 rounded-full h-8 w-8 -mt-1 -mr-2 transition-colors">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-primary/10 bg-linear-to-br from-primary/5 to-transparent p-4">
                      <p className="text-2xl font-medium text-base-content text-right leading-loose" dir="rtl">{dua.arabic}</p>
                    </div>
                    <div className="bg-base-200/60 p-3 rounded-lg border border-base-300/80">
                      <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1">Meaning</p>
                      <p className="text-sm text-base-content/85 leading-relaxed">{dua.meaning}</p>
                    </div>
                    {dua.reference ? <p className="text-xs text-base-content/50 text-right">{dua.reference}</p> : null}
                  </CardContent>
                </Card>
              </Motion.div>
            ))}
          </div>
          {filteredDuas.length === 0 && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              No duas matched your search.
            </Motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Community Dua Board — Phase 4 */}
      <CommunityDuaBoard userId={user?._id} />
    </div>
  );
}
