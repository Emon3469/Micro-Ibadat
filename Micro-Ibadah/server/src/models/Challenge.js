const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        type: { type: String, enum: ["quran", "dhikr", "salah", "fast", "custom"], default: "custom" },
        goal: { type: Number, required: true }, // e.g. 100 ayahs, 500 dhikr
        unit: { type: String, default: "count" },
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        participants: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                progress: { type: Number, default: 0 },
                completed: { type: Boolean, default: false },
                completedAt: { type: Date },
            },
        ],
        endsAt: { type: Date },
        active: { type: Boolean, default: true },
        hasanatReward: { type: Number, default: 200 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
