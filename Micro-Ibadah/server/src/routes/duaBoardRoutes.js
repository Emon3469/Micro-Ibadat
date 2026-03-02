const express = require("express");
const DuaBoard = require("../models/DuaBoard");
const User = require("../models/User");

const router = express.Router();

// Get all active dua requests (not expired)
router.get("/", async (_req, res) => {
    const duas = await DuaBoard.find({ expiresAt: { $gt: new Date() } })
        .sort({ createdAt: -1 })
        .limit(30);
    res.json(duas);
});

// Post a new anonymous dua request (24h TTL)
router.post("/", async (req, res) => {
    const { text, category } = req.body;
    if (!text || text.trim().length < 5) {
        return res.status(400).json({ message: "Dua text too short" });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now
    const dua = new DuaBoard({
        text: text.trim().slice(0, 280),
        category: category || "general",
        expiresAt,
    });

    await dua.save();
    res.status(201).json(dua);
});

// Say "Ameen" to a dua
router.post("/:id/ameen", async (req, res) => {
    const { userId } = req.body || {};
    const dua = await DuaBoard.findById(req.params.id);
    if (!dua) return res.status(404).json({ message: "Dua not found" });
    dua.ameen += 1;
    await dua.save();

    if (userId) {
        await User.findByIdAndUpdate(userId, { $inc: { ameenCount: 1, hasanatPoints: 1, rpgXp: 1 } });
    }

    res.json({ ameen: dua.ameen });
});

module.exports = router;
