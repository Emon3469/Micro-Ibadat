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
    user.consistencyScore = user.streakDays * 10 + user.totalCheckIns;
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

module.exports = router;
