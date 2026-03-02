const mongoose = require("mongoose");

const duaBoardSchema = new mongoose.Schema(
    {
        text: { type: String, required: true, maxlength: 280 },
        category: { type: String, default: "general" },
        ameen: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true }, // 24h TTL
        authorLabel: { type: String, default: "A Brother/Sister" }, // Anonymous
    },
    { timestamps: true }
);

// TTL index to auto-delete after expiry
duaBoardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("DuaBoard", duaBoardSchema);
