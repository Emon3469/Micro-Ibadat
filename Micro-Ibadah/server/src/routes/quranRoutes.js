const express = require("express");
const { calculateQuranPlan } = require("../utils/quran");
const User = require("../models/User");

const router = express.Router();

router.post("/calculate", (req, res) => {
  const { ayahsPerRead, timesPerDay, startedAt } = req.body;
  const result = calculateQuranPlan({ ayahsPerRead, timesPerDay, startedAt });
  res.json(result);
});

router.get("/tracker/:userId", async (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const user = await User.findById(req.params.userId).select("quranReadings quranAyahsRead");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const entries = (user.quranReadings || []).filter((item) => item.dateKey === date);
  const todayTotal = entries.reduce((sum, item) => sum + Number(item.ayahsRead || 0), 0);

  return res.json({
    date,
    todayTotal,
    overallTotal: user.quranAyahsRead || 0,
    entries,
  });
});

router.post("/tracker/:userId/log", async (req, res) => {
  const { surahNumber, surahName, ayahsRead, date } = req.body;
  if (!surahNumber || !ayahsRead || Number(ayahsRead) < 1) {
    return res.status(400).json({ message: "Invalid surah or ayah count" });
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const dateKey = date || new Date().toISOString().split("T")[0];
  const amount = Number(ayahsRead);

  const existing = user.quranReadings.find(
    (entry) => entry.dateKey === dateKey && Number(entry.surahNumber) === Number(surahNumber)
  );

  if (existing) {
    existing.ayahsRead = Number(existing.ayahsRead || 0) + amount;
    if (surahName) existing.surahName = surahName;
  } else {
    user.quranReadings.push({
      dateKey,
      surahNumber: Number(surahNumber),
      surahName: surahName || `Surah ${surahNumber}`,
      ayahsRead: amount,
    });
  }

  user.quranAyahsRead = (user.quranAyahsRead || 0) + amount;
  user.hasanatPoints = (user.hasanatPoints || 0) + Math.max(1, Math.floor(amount / 2));
  user.rpgXp = (user.rpgXp || 0) + Math.max(1, Math.floor(amount / 5));
  await user.save();

  const entries = user.quranReadings.filter((item) => item.dateKey === dateKey);
  const todayTotal = entries.reduce((sum, item) => sum + Number(item.ayahsRead || 0), 0);

  return res.status(201).json({
    date: dateKey,
    todayTotal,
    overallTotal: user.quranAyahsRead || 0,
    entries,
  });
});

module.exports = router;
