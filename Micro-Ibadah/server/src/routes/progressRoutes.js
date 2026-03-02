const express = require("express");
const User = require("../models/User");
const Routine = require("../models/Routine");

const router = express.Router();

router.post("/check-in/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const today = new Date();
  const last = user.lastCheckInAt ? new Date(user.lastCheckInAt) : null;

  const isSameDay =
    last &&
    last.getUTCFullYear() === today.getUTCFullYear() &&
    last.getUTCMonth() === today.getUTCMonth() &&
    last.getUTCDate() === today.getUTCDate();

  if (!isSameDay) {
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const wasYesterday =
      last &&
      last.getUTCFullYear() === yesterday.getUTCFullYear() &&
      last.getUTCMonth() === yesterday.getUTCMonth() &&
      last.getUTCDate() === yesterday.getUTCDate();

    user.streakDays = wasYesterday ? user.streakDays + 1 : 1;
    user.totalCheckIns += 1;
    user.lastCheckInAt = today;
    if (today.getHours() >= 4 && today.getHours() < 6) {
      user.fajrCheckIns = (user.fajrCheckIns || 0) + 1;
    }
    user.consistencyScore = user.streakDays * 10 + user.totalCheckIns;
    user.hasanatPoints = (user.hasanatPoints || 0) + 50 + (user.streakDays * 5); // Base 50 + streak bonus

    // Check if streak broke recently to potentially flag for catch-up
    if (!wasYesterday && last) {
      user.lastMissedDate = yesterday;
    }

    await user.save();
  }

  return res.json(user);
});

router.post("/catch-up/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.lastMissedDate) {
    // Soft recovery: Restore previous streak + 1 
    // We assume they lost it and dropped to 1. So we need a mechanism to restore.
    // In a real app we'd track the *previous* streak amount. For MVP, we'll give a static boost of 3 days.
    user.streakDays += 3;
    user.lastMissedDate = null; // Clear the flag
    user.hasanatPoints = (user.hasanatPoints || 0) + 20; // Small bonus for catching up
    await user.save();
  }

  return res.json(user);
});

router.get("/dashboard/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const routine = await Routine.findOne({ user: req.params.userId }).lean();
  const slots = routine?.slots || [];
  const quranSlots = slots.filter((slot) => slot.activity === "quran").length;
  const duaSlots = slots.filter((slot) => slot.activity === "dua").length;

  return res.json({
    user,
    todayCompleted: Math.min(5, quranSlots + duaSlots),
    quranSlots,
    duaSlots,
    reflectionPrompt: "What small deed helped you stay consistent this week?",
  });
});

router.put("/tasbih/:userId", async (req, res) => {
  const { count } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.tasbihCount = (user.tasbihCount || 0) + Number(count || 0);

  // Award Hasanat for completing a set of 33 or 99
  if (count === 33) {
    user.hasanatPoints = (user.hasanatPoints || 0) + 15;
  } else if (count === 99) {
    user.hasanatPoints = (user.hasanatPoints || 0) + 50;
  }

  await user.save();
  return res.json({ tasbihCount: user.tasbihCount, hasanatPoints: user.hasanatPoints });
});

router.post("/shawwal/:userId", async (req, res) => {
  const { day } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const existingFast = user.shawwalDays.find((f) => f.day === day);
  if (existingFast) {
    existingFast.logged = !existingFast.logged;
  } else {
    user.shawwalDays.push({ day, logged: true });
  }

  // Bonus hasanat for fasting Shawwal
  user.hasanatPoints = (user.hasanatPoints || 0) + 100;

  await user.save();
  return res.json({ shawwalDays: user.shawwalDays, hasanatPoints: user.hasanatPoints });
});

router.post("/reflection/:userId", async (req, res) => {
  const { prompt, text } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.reflections.push({ date: new Date(), prompt, text });
  await user.save();
  return res.json({ reflections: user.reflections });
});

router.post("/taraweeh/:userId", async (req, res) => {
  const { day, count } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const existingDay = user.taraweehDays.find(t => t.day === Number(day));
  if (existingDay) {
    existingDay.logged = true;
    existingDay.count = Number(count);
  } else {
    user.taraweehDays.push({ day: Number(day), logged: true, count: Number(count) });
  }

  await user.save();
  return res.json({ taraweehDays: user.taraweehDays });
});

router.get("/eid-card/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId).select("name nickname hasanatPoints streakDays eidCardGenerated eidCardUrl eidCardGeneratedAt eidCardMessage");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    generated: Boolean(user.eidCardGenerated),
    card: user.eidCardGenerated
      ? {
          url: user.eidCardUrl,
          generatedAt: user.eidCardGeneratedAt,
          message: user.eidCardMessage,
          name: user.nickname || user.name,
          hasanatPoints: user.hasanatPoints || 0,
          streakDays: user.streakDays || 0,
        }
      : null,
  });
});

router.post("/eid-card/:userId/generate", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const completedDay30 = (user.taraweehDays || []).some((entry) => entry.day >= 30 && entry.logged);
  if (!completedDay30) {
    return res.status(400).json({ message: "Eid card unlocks after completing Day 30." });
  }

  if (!user.eidCardGenerated) {
    const createdAt = new Date();
    user.eidCardGenerated = true;
    user.eidCardGeneratedAt = createdAt;
    user.eidCardMessage = `Eid Mubarak! ${user.nickname || user.name} completed 30 days of Micro-Ibadah.`;
    user.eidCardUrl = `/eid-card/${user._id}-${createdAt.getTime()}`;
    user.hasanatPoints = (user.hasanatPoints || 0) + 300;
    user.rpgXp = (user.rpgXp || 0) + 150;
    await user.save();
  }

  return res.status(201).json({
    generated: true,
    card: {
      url: user.eidCardUrl,
      generatedAt: user.eidCardGeneratedAt,
      message: user.eidCardMessage,
      name: user.nickname || user.name,
      hasanatPoints: user.hasanatPoints || 0,
      streakDays: user.streakDays || 0,
    },
  });
});

module.exports = router;
