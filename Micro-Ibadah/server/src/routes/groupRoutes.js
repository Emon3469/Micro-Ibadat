const express = require("express");
const crypto = require("crypto");
const Group = require("../models/Group");
const User = require("../models/User");

const router = express.Router();

router.post("/create", async (req, res) => {
    const { name, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const group = new Group({
        name,
        inviteCode,
        members: [user._id]
    });

    await group.save();

    // Add group to user
    if (!user.groups) user.groups = [];
    user.groups.push(group._id);
    await user.save();

    return res.json(group);
});

router.post("/join", async (req, res) => {
    const { inviteCode, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!group) {
        return res.status(404).json({ message: "Invalid invite code" });
    }

    if (!group.members.includes(user._id)) {
        group.members.push(user._id);
        await group.save();
    }

    if (!user.groups.includes(group._id)) {
        user.groups.push(group._id);
        await user.save();
    }

    return res.json(group);
});

router.get("/:groupId", async (req, res) => {
    const group = await Group.findById(req.params.groupId).populate({
        path: "members",
        select: "name nickname department isAnonymous streakDays hasanatPoints consistencyScore",
    });

    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }

    return res.json(group);
});

router.get("/user/:userId", async (req, res) => {
    const user = await User.findById(req.params.userId).populate("groups");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json(user.groups);
});

module.exports = router;
