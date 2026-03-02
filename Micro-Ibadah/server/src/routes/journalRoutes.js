const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Journal prompts - rotated nightly
const JOURNAL_PROMPTS = [
    "What small deed brought you closest to Allah today?",
    "Which moment in Qur'an touched your heart this week?",
    "If tomorrow you could only do one ibadah, which would you choose and why?",
    "What distracted you most from worship today? How can you remove it tomorrow?",
    "Name one person you should make dua for tonight.",
    "What mercy of Allah are you most grateful for today?",
    "How did fasting change your perspective today?",
    "Which dhikr gave you the most peace today?",
    "Write a letter to your future self about this Ramadan.",
    "What would Laylatul Qadr look like if it were tonight?",
    "How has your heart softened this Ramadan?",
    "What habit do you want to carry into Shawwal?",
    "Describe a moment today where you felt genuine tawakkul (trust in Allah).",
    "What dua do you make most often, and why?",
    "If you could change one thing about your worship routine, what would it be?",
    "How did you show kindness today? Could you do more tomorrow?",
    "Name three things that made you smile in the past 24 hours.",
    "What verse of Qur'an would you choose as your motto for this Ramadan?",
    "How did you share barakah with someone today?",
    "As the night deepens, what whispers does your heart send to Allah?",
];

function getPromptForDay(day) {
    return JOURNAL_PROMPTS[(day - 1) % JOURNAL_PROMPTS.length];
}

// Get today's prompt (based on Ramadan day param or current date)
router.get("/prompt", (req, res) => {
    const day = parseInt(req.query.day) || new Date().getDate();
    const prompt = getPromptForDay(day);
    res.json({ prompt, day });
});

// Get user's journal entries
router.get("/:userId", async (req, res) => {
    const user = await User.findById(req.params.userId).select("journalEntries");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Save a new journal entry
router.post("/:userId", async (req, res) => {
    const { prompt, text, mood } = req.body;
    if (!text || text.trim().length < 3) {
        return res.status(400).json({ message: "Entry too short" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.journalEntries.push({
        date: new Date(),
        prompt: prompt || "Free reflection",
        text: text.trim(),
        mood: mood || "neutral",
    });

    // Award XP and hasanat for journaling
    user.hasanatPoints = (user.hasanatPoints || 0) + 20;
    user.rpgXp = (user.rpgXp || 0) + 10;

    await user.save();
    res.status(201).json({
        journalEntries: user.journalEntries,
        hasanatPoints: user.hasanatPoints,
    });
});

module.exports = router;
