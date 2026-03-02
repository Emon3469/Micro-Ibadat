const express = require("express");
const User = require("../models/User");

const router = express.Router();

// RPG Level thresholds
const RPG_LEVELS = [
    { level: "Salik", minXp: 0, maxXp: 199, color: "#6b7280" },
    { level: "Mureed", minXp: 200, maxXp: 499, color: "#3b82f6" },
    { level: "Zahid", minXp: 500, maxXp: 999, color: "#8b5cf6" },
    { level: "Arif", minXp: 1000, maxXp: 1999, color: "#f59e0b" },
    { level: "Wali", minXp: 2000, maxXp: 4999, color: "#10b981" },
    { level: "Qutb", minXp: 5000, maxXp: Infinity, color: "#ef4444" },
];

const RARE_BADGES = [
    { id: "night_owl", label: "🦉 Night Owl", desc: "Completed ibadah after midnight 3 times", xp: 50 },
    { id: "streak_7", label: "🔥 Week Warrior", desc: "7-day streak maintained", xp: 100 },
    { id: "streak_30", label: "💎 Diamond Ramadan", desc: "Full 30-day streak", xp: 500 },
    { id: "tasbih_1000", label: "📿 Dhikr Master", desc: "Reached 1,000 total tasbih", xp: 150 },
    { id: "quran_khatam", label: "📖 Khatam Hero", desc: "Completed Qur'an reading plan", xp: 300 },
    { id: "journal_7", label: "✍️ Reflective Soul", desc: "Wrote 7 journal entries", xp: 100 },
    { id: "laylatul_qadr", label: "⭐ Qadr Seeker", desc: "Active on Laylatul Qadr nights", xp: 200 },
    { id: "early_bird", label: "🌅 Fajr Champion", desc: "Checked in at Fajr time 5 times", xp: 75 },
    { id: "group_leader", label: "👑 Squad Leader", desc: "Created a challenge for your group", xp: 100 },
    { id: "helper", label: "🤲 Dua Angel", desc: "Gave Ameen to 10 community duas", xp: 50 },
];

function getLevelInfo(xp) {
    return RPG_LEVELS.find(l => xp >= l.minXp && xp <= l.maxXp) || RPG_LEVELS[0];
}

function getNextLevel(xp) {
    const idx = RPG_LEVELS.findIndex(l => xp >= l.minXp && xp <= l.maxXp);
    return idx < RPG_LEVELS.length - 1 ? RPG_LEVELS[idx + 1] : null;
}

function hasLaylatulQadrActivity(user) {
    const qadrNights = [21, 23, 25, 27, 29];
    const activeCount = (user.taraweehDays || []).filter((entry) => qadrNights.includes(entry.day) && entry.count > 0).length;
    return activeCount >= 2;
}

function getNightOwlCount(user) {
    return (user.journalEntries || []).filter((entry) => {
        const hour = new Date(entry.date).getHours();
        return hour < 3;
    }).length;
}

function evaluateAutoBadges(user) {
    return [
        { id: "night_owl", earned: getNightOwlCount(user) >= 3 },
        { id: "streak_7", earned: (user.streakDays || 0) >= 7 },
        { id: "streak_30", earned: (user.streakDays || 0) >= 30 },
        { id: "tasbih_1000", earned: (user.tasbihCount || 0) >= 1000 },
        { id: "quran_khatam", earned: (user.quranAyahsRead || 0) >= 6236 },
        { id: "journal_7", earned: (user.journalEntries || []).length >= 7 },
        { id: "laylatul_qadr", earned: hasLaylatulQadrActivity(user) },
        { id: "early_bird", earned: (user.fajrCheckIns || 0) >= 5 },
        { id: "group_leader", earned: (user.createdChallengeCount || 0) >= 1 },
        { id: "helper", earned: (user.ameenCount || 0) >= 10 },
    ]
        .filter((item) => item.earned)
        .map((item) => item.id);
}

function applyBadges(user, badgeIds) {
    let addedXp = 0;
    if (!Array.isArray(user.badges)) {
        user.badges = [];
    }
    const existing = new Set(user.badges || []);

    badgeIds.forEach((badgeId) => {
        if (existing.has(badgeId)) return;
        const badge = RARE_BADGES.find((item) => item.id === badgeId);
        if (!badge) return;
        user.badges.push(badgeId);
        addedXp += badge.xp;
    });

    if (addedXp > 0) {
        user.rpgXp = (user.rpgXp || 0) + addedXp;
        user.hasanatPoints = (user.hasanatPoints || 0) + addedXp;
        user.rpgLevel = getLevelInfo(user.rpgXp).level;
    }

    return addedXp;
}

// Get user's full RPG profile
router.get("/:userId", async (req, res) => {
    const user = await User.findById(req.params.userId).select(
        "name nickname rpgLevel rpgXp badges streakDays hasanatPoints totalCheckIns tasbihCount journalEntries taraweehDays quranAyahsRead fajrCheckIns createdChallengeCount ameenCount"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const autoBadges = evaluateAutoBadges(user);
    const gainedXp = applyBadges(user, autoBadges);
    if (gainedXp > 0) {
        await user.save();
    }

    const xp = user.rpgXp || 0;
    const currentLevel = getLevelInfo(xp);
    const nextLevel = getNextLevel(xp);
    const xpToNext = nextLevel ? nextLevel.minXp - xp : 0;
    const progressPct = nextLevel
        ? Math.round(((xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100)
        : 100;

    res.json({
        user,
        rpg: {
            xp,
            currentLevel,
            nextLevel,
            xpToNext,
            progressPct,
            allLevels: RPG_LEVELS,
        },
        rareBadges: RARE_BADGES,
        earnedBadges: user.badges || [],
    });
});

// Award a badge to user
router.post("/:userId/badge", async (req, res) => {
    const { badgeId } = req.body;
    const badge = RARE_BADGES.find(b => b.id === badgeId);
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.badges.includes(badge.id)) {
        user.badges.push(badge.id);
        user.rpgXp = (user.rpgXp || 0) + badge.xp;
        user.hasanatPoints = (user.hasanatPoints || 0) + badge.xp;

        // Update RPG level
        const newLevel = getLevelInfo(user.rpgXp);
        user.rpgLevel = newLevel.level;

        await user.save();
    }

    res.json({ badges: user.badges, rpgXp: user.rpgXp, rpgLevel: user.rpgLevel });
});

// Update XP and check for level up
router.post("/:userId/xp", async (req, res) => {
    const { amount } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldLevel = getLevelInfo(user.rpgXp || 0);
    user.rpgXp = (user.rpgXp || 0) + Number(amount || 0);
    const newLevel = getLevelInfo(user.rpgXp);

    const leveledUp = oldLevel.level !== newLevel.level;
    user.rpgLevel = newLevel.level;
    await user.save();

    res.json({ rpgXp: user.rpgXp, rpgLevel: user.rpgLevel, leveledUp, newLevel });
});

module.exports = router;
