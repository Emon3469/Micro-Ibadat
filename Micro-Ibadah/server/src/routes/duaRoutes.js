const express = require("express");
const duas = require("../data/duas");

const router = express.Router();

router.get("/", (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.json(duas);
  }

  const filtered = duas.filter((dua) => dua.category.toLowerCase() === String(category).toLowerCase());
  return res.json(filtered);
});

module.exports = router;
