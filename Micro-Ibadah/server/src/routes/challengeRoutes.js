const express = require("express");
const Challenge = require("../models/Challenge");
const User = require("../models/User");

const router = express.Router();

// Get all active challenges (optionally filtered by groupId)
router.get("/", async (req, res) => {
    const filter = { active: true };
    if (req.query.groupId) filter.groupId = req.query.groupId;
    const challenges = await Challenge.find(filter)
        .populate("participants.userId", "name nickname isAnonymous")
        .sort({ createdAt: -1 });
    res.json(challenges);
});

// Create a new challenge
router.post("/", async (req, res) => {
    const { title, description, type, goal, unit, groupId, endsAt, hasanatReward, createdBy } = req.body;
    const challenge = new Challenge({
        title, description, type, goal, unit, groupId, endsAt,
        hasanatReward: hasanatReward || 200,
        createdBy,
        participants: createdBy ? [{ userId: createdBy, progress: 0 }] : [],
    });
    await challenge.save();

    if (createdBy) {
        await User.findByIdAndUpdate(createdBy, { $inc: { createdChallengeCount: 1, rpgXp: 10 } });
    }

    res.status(201).json(challenge);
});

// Join a challenge
router.post("/:id/join", async (req, res) => {
    const { userId } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const alreadyJoined = challenge.participants.some(p => p.userId.toString() === userId);
    if (!alreadyJoined) {
        challenge.participants.push({ userId, progress: 0 });
        await challenge.save();
    }
    res.json(challenge);
});

// Update progress in a challenge
router.post("/:id/progress", async (req, res) => {
    const { userId, increment } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    const participant = challenge.participants.find(p => p.userId.toString() === userId);
    if (!participant) return res.status(400).json({ message: "Not a participant" });

    participant.progress = Math.min(challenge.goal, participant.progress + Number(increment || 1));

    if (participant.progress >= challenge.goal && !participant.completed) {
        participant.completed = true;
        participant.completedAt = new Date();
        // Award hasanat
        const user = await User.findById(userId);
        if (user) {
            user.hasanatPoints = (user.hasanatPoints || 0) + challenge.hasanatReward;
            user.rpgXp = (user.rpgXp || 0) + 50;
            await user.save();
        }
    }

    await challenge.save();
    res.json(challenge);
});

module.exports = router;
