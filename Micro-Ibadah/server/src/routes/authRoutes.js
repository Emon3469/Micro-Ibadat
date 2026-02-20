const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/student", async (req, res) => {
  const { name, email, studentId, department, nickname } = req.body;
  if (!name || !email || !studentId) {
    return res.status(400).json({ message: "name, email, studentId are required" });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
  if (existingUser) {
    return res.json(existingUser);
  }

  const user = await User.create({ name, email, studentId, department, nickname });
  return res.status(201).json(user);
});

module.exports = router;
