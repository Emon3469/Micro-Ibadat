const express = require("express");
const User = require("../models/User");
const Routine = require("../models/Routine");

const router = express.Router();

// AI Coach — rule-based conversation engine
// Pre-built responses based on topic detection, no external API needed
const COACH_RESPONSES = {
    greeting: [
        "Assalamu Alaikum! I'm your Micro-Ibadah AI Coach. How can I help you today? You can ask me about your streak, duas, quran reading plan, or managing your time.",
        "Wa Alaikum Assalam! Ready to help you make the most of Ramadan. What's on your mind?",
    ],
    streak: [
        "Consistency is light upon light. Even on hard days, a single tasbeeh counts! Your streak is building character, not just numbers.",
        "Prophet (ﷺ) said: 'The most beloved deeds to Allah are the most regular, even if small.' Every day you show up matters.",
        "Missed a day? Use the Catch-up mode. Recovery is sunnah — don't let Shaitan convince you to give up entirely.",
    ],
    quran: [
        "Start small — 5 ayahs after each salah is 25 ayahs/day. By Ramadan's end, you'll have read hundreds of ayahs more than if you hadn't tried.",
        "The Quran was revealed in Ramadan. Every letter you recite earns 10 hasanat. Your reading plan is your treasure map.",
        "Tip: Pair Quran recitation with your longest free slot. Even 10 minutes of focused reading builds the habit.",
    ],
    dua: [
        "The best times for dua: before iftar, in sujood, after Fajr, and the last third of the night. Set a reminder!",
        "Dua is the essence of worship. Allah says: 'Call upon Me; I will respond to you.' — [Quran 40:60]",
        "Make dua in your native language too — pour your heart out. Allah understands every language of the heart.",
    ],
    time: [
        "Look for the 'forgotten' 5 minutes — before class, while walking, waiting for food. These micro-moments add up to big rewards.",
        "Adaptive Routine tip: If your Asr slot feels rushed, try shifting it to right after Dhuhr when you have a break.",
        "The Pomodoro of Ibadah: 25 min study, 5 min dhikr. Your brain gets a break AND your soul gets nourishment.",
    ],
    motivation: [
        "You're doing amazing. The fact that you're here means Allah guided you to seek improvement. That itself is a gift.",
        "Ramadan is a training camp. The habits you build now will carry you to Shawwal and beyond, insha Allah.",
        "Every point of hasanat you earn is an investment in your akhirah that no market crash can erase.",
    ],
    salah: [
        "5 salah is the pillar. Everything else — Quran, dhikr, dua — supports it. Build your day around salah, not salah around your day.",
        "Tip: Pray the sunnah of Fajr even if you miss the fard — the Prophet (ﷺ) almost never skipped it.",
        "Khushu (concentration) comes with practice. Start by making wudu slowly and saying Bismillah consciously.",
    ],
    sleep: [
        "For Suhoor, try sleeping earlier (after Isha) and waking up just before Fajr. A 20-min power nap after Dhuhr helps too.",
        "Limit screen time after Taraweeh. Ayatul Kursi before sleep is both sunnah and calming.",
    ],
    default: [
        "That's a great question! I'd suggest focusing on consistency over intensity this Ramadan. Small deeds done regularly are most beloved to Allah.",
        "SubhanAllah! Let's think about this together. What small step can you take right now towards that goal?",
        "JazakAllah khair for sharing. My advice: start with one tiny change and build from there. What's the smallest version of what you want to achieve?",
    ],
};

function detectTopic(message) {
    const msg = message.toLowerCase();
    if (msg.match(/salam|hello|hi|hey|assalamu/)) return "greeting";
    if (msg.match(/streak|consecutive|days|missed|catch/)) return "streak";
    if (msg.match(/quran|ayah|surah|reading|hafiz|recit/)) return "quran";
    if (msg.match(/dua|pray|supplication|time|best time/)) return "dua";
    if (msg.match(/time|schedule|busy|class|routine|shift|manage/)) return "time";
    if (msg.match(/motivat|tired|hard|difficult|give up|struggle/)) return "motivation";
    if (msg.match(/salah|prayer|fajr|dhuhr|asr|maghrib|isha|sunnah/)) return "salah";
    if (msg.match(/sleep|suhoor|iftar|night|rest|nap/)) return "sleep";
    return "default";
}

// Get AI coach conversation response
router.post("/chat", async (req, res) => {
    const { message, userId } = req.body;
    if (!message) return res.status(400).json({ message: "No message provided" });

    const topic = detectTopic(message);
    const responses = COACH_RESPONSES[topic] || COACH_RESPONSES.default;
    const reply = responses[Math.floor(Math.random() * responses.length)];

    // If userId provided, award a small XP for engaging with coach
    if (userId) {
        try {
            await User.findByIdAndUpdate(userId, { $inc: { rpgXp: 2 } });
        } catch (_e) { /* silent */ }
    }

    // Add contextual suggestion
    const suggestions = [
        "💡 Check your routine in the Dashboard",
        "📿 Try a quick dhikr session in /dhikr",
        "📖 Update your Quran plan at /quran",
        "🗺️ See your Ramadan heatmap at /ramadan-map",
        "✍️ Write tonight's reflection at /journal",
    ];
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    res.json({ reply, topic, suggestion });
});

// Get suggested routine time shifts (adaptive routine)
router.get("/adaptive/:userId", async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const routine = await Routine.findOne({ user: req.params.userId });
    const slots = routine?.slots || [];

    const suggestions = [];

    // If user hasn't checked in recently, suggest morning ibadah
    if (!user.lastCheckInAt || (Date.now() - new Date(user.lastCheckInAt)) > 48 * 3600000) {
        suggestions.push({
            type: "routine_shift",
            from: "evening",
            to: "morning",
            reason: "You seem most consistent in the morning. Try shifting your main ibadah to post-Fajr.",
            icon: "🌅",
        });
    }

    // If quran slots are few, suggest adding more
    const quranSlots = slots.filter(s => s.activity === "quran").length;
    if (quranSlots < 2) {
        suggestions.push({
            type: "add_slot",
            activity: "quran",
            reason: "You only have " + quranSlots + " Quran slot(s). Try adding one after lunch.",
            icon: "📖",
            suggestedTime: "13:00",
        });
    }

    // Streak based suggestions
    if (user.streakDays >= 7) {
        suggestions.push({
            type: "upgrade",
            reason: "MashaAllah! 7+ day streak. Consider adding night Tahajjud to your routine.",
            icon: "🌙",
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            type: "affirm",
            reason: "Your routine looks solid! Keep up the consistency. Consider adding variety like a different dhikr each day.",
            icon: "✅",
        });
    }

    res.json({ suggestions, streakDays: user.streakDays });
});

module.exports = router;
