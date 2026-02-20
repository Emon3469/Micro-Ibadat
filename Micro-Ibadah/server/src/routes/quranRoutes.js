const express = require("express");
const { calculateQuranPlan } = require("../utils/quran");

const router = express.Router();

router.post("/calculate", (req, res) => {
  const { ayahsPerRead, timesPerDay, startedAt } = req.body;
  const result = calculateQuranPlan({ ayahsPerRead, timesPerDay, startedAt });
  res.json(result);
});

module.exports = router;
