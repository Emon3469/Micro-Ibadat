const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, // Optional for backward compatibility but required for new users
    studentId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, default: "General" },
    nickname: { type: String, default: "Anonymous Ibadah Hero" },
    isAnonymous: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    onboardingComplete: { type: Boolean, default: false },
    rpgLevel: { type: String, default: "Salik" },
    rpgXp: { type: Number, default: 0 },
    badges: [{ type: String }],
    streakDays: { type: Number, default: 0 },
    totalCheckIns: { type: Number, default: 0 },
    fajrCheckIns: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    lastCheckInAt: { type: Date },
    tasbihCount: { type: Number, default: 0 },
    quranAyahsRead: { type: Number, default: 0 },
    quranReadings: [
      {
        dateKey: { type: String, required: true },
        surahNumber: { type: Number, required: true },
        surahName: { type: String },
        ayahsRead: { type: Number, default: 0 },
      },
    ],
    taraweehDays: [
      {
        day: { type: Number, required: true },
        logged: { type: Boolean, default: false },
        count: { type: Number, default: 0 },
      },
    ],
    reflections: [
      {
        date: { type: Date, required: true },
        prompt: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    hasanatPoints: { type: Number, default: 0 },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    lastMissedDate: { type: Date },
    shawwalDays: [
      {
        day: { type: Number, required: true },
        logged: { type: Boolean, default: false },
      },
    ],
    journalEntries: [
      {
        date: { type: Date, required: true },
        prompt: { type: String, required: true },
        text: { type: String, required: true },
        mood: { type: String, default: "neutral" },
      },
    ],
    eidCardGenerated: { type: Boolean, default: false },
    eidCardUrl: { type: String },
    eidCardGeneratedAt: { type: Date },
    eidCardMessage: { type: String },
    createdChallengeCount: { type: Number, default: 0 },
    ameenCount: { type: Number, default: 0 },
    challengeGoals: [
      {
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
    ],
    adaptiveShifts: [
      {
        date: { type: Date },
        from: { type: String },
        to: { type: String },
        reason: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
