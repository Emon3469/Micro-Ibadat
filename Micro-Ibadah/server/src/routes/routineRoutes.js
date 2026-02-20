const express = require("express");
const Routine = require("../models/Routine");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const routine = await Routine.findOne({ user: req.params.userId });
  res.json(routine || { user: req.params.userId, slots: [] });
});

router.put("/:userId", async (req, res) => {
  const { slots } = req.body;
  const sanitizedSlots = Array.isArray(slots)
    ? slots.map((slot) => ({
        ...slot,
        durationMinutes: [2, 5, 10].includes(Number(slot.durationMinutes))
          ? Number(slot.durationMinutes)
          : 5,
      }))
    : [];

  const routine = await Routine.findOneAndUpdate(
    { user: req.params.userId },
    { user: req.params.userId, slots: sanitizedSlots },
    { new: true, upsert: true }
  );
  res.json(routine);
});

module.exports = router;
