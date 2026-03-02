const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        inviteCode: { type: String, required: true, unique: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        groupTarget: { type: Number, default: 5000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
