const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
    type: { type: String, enum: ["class", "free"], default: "free" },
    activity: {
      type: String,
      enum: ["quran", "dua", "dhikr", "none"],
      default: "none",
    },
    durationMinutes: { type: Number, enum: [2, 5, 10], default: 5 },
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    slots: [slotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Routine", routineSchema);
