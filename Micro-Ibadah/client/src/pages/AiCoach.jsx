import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { sendAiCoachMessage, fetchAdaptiveRoutine } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STARTER_QUESTIONS = [
  "How do I maintain my streak when I'm busy with university?",
  "What's the best time for Quran in a student schedule?",
  "I missed a day — how do I recover?",
  "How can I build khushu in salah?",
  "Any tips for waking up for Fajr?",
  "How do I make dua properly?",
];

export default function AiCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Assalamu Alaikum! 🌙 I'm your Micro-Ibadah AI Coach. I'm here to help you maximize your Ramadan journey — whether it's about your streak, Quran plan, duas, or managing your schedule. What's on your mind?",
      suggestion: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [adaptive, setAdaptive] = useState(null);
  const [showAdaptive, setShowAdaptive] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user?._id) {
      fetchAdaptiveRoutine(user._id).then(setAdaptive).catch(() => {});
    }
  }, [user]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const data = await sendAiCoachMessage(userMsg, user?._id);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply,
        suggestion: data.suggestion,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having a moment of reflection. Please try again shortly! 🤲",
        suggestion: null,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">AI Coach</h1>
              <p className="text-indigo-300 text-xs">Your Ramadan spiritual guide</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdaptive(!showAdaptive)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs hover:bg-indigo-500/30 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Suggestions
          </button>
        </div>

        {/* Adaptive Routine panel */}
        <AnimatePresence>
          {showAdaptive && adaptive?.suggestions && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-2xl mx-auto mt-3 overflow-hidden"
            >
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-900/50 p-4 space-y-2">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">🧠 Adaptive Routine Tips</p>
                {adaptive.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-indigo-200">
                    <span>{s.icon}</span>
                    <p>{s.reason}</p>
                  </div>
                ))}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <Motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === "assistant"
                  ? "bg-indigo-500/20 border border-indigo-400/30"
                  : "bg-amber-500/20 border border-amber-400/30"
              }`}>
                {msg.role === "assistant"
                  ? <Bot className="w-4 h-4 text-indigo-300" />
                  : <User className="w-4 h-4 text-amber-300" />
                }
              </div>
              <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-slate-800/80 text-slate-100 border border-slate-700"
                    : "bg-indigo-600 text-white"
                }`}>
                  {msg.content}
                </div>
                {msg.suggestion && (
                  <p className="text-xs text-indigo-400 px-2">{msg.suggestion}</p>
                )}
              </div>
            </Motion.div>
          ))}

          {loading && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <Motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.5 }}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  ))}
                </div>
              </div>
            </Motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Starter questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-indigo-400 mb-2 text-center">Quick questions to get started:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTER_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-6 pt-2">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
