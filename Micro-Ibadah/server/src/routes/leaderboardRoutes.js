const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const { department } = req.query;
  const filter = department ? { department } : {};
  const users = await User.find(filter)
    .sort({ consistencyScore: -1, streakDays: -1, totalCheckIns: -1 })
    .limit(20)
    .lean();

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    userId: user._id,
    name: user.isAnonymous ? user.nickname : user.name,
    department: user.department,
    streakDays: user.streakDays,
    consistencyScore: user.consistencyScore,
    badges: [
      user.streakDays >= 7 ? "7-Day Consistency" : null,
      user.totalCheckIns >= 15 ? "Never Missed Dua Reminder" : null,
    ].filter(Boolean),
  }));

  res.json(leaderboard);
});

module.exports = router;
