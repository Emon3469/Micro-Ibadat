const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    ramadanStart: { type: Date },
    ramadanEnd: { type: Date },
    salahTimes: {
      fajr: { type: String, default: "05:00" },
      suhoor: { type: String, default: "04:30" },
      dhuhr: { type: String, default: "12:15" },
      asr: { type: String, default: "15:45" },
      maghrib: { type: String, default: "18:10" },
      iftar: { type: String, default: "18:10" },
      isha: { type: String, default: "19:30" },
    },
    leaderboardRule: { type: String, default: "consistency-first" },
    broadcastMessage: { type: String, default: "" },
    broadcastExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
