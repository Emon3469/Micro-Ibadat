const express = require("express");
const AdminSettings = require("../models/AdminSettings");

const router = express.Router();

router.get("/settings", async (_req, res) => {
  const settings = await AdminSettings.findOne({ key: "global" });
  res.json(
    settings || {
      key: "global",
      salahTimes: {
        fajr: "05:00",
        dhuhr: "12:15",
        asr: "15:45",
        maghrib: "18:10",
        isha: "19:30",
      },
    }
  );
});

router.put("/settings", async (req, res) => {
  const payload = req.body;
  const settings = await AdminSettings.findOneAndUpdate(
    { key: "global" },
    { ...payload, key: "global" },
    { new: true, upsert: true }
  );
  res.json(settings);
});

module.exports = router;
