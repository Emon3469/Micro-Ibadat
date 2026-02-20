const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, default: "General" },
    nickname: { type: String, default: "Anonymous Ibadah Hero" },
    isAnonymous: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    streakDays: { type: Number, default: 0 },
    totalCheckIns: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    lastCheckInAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
