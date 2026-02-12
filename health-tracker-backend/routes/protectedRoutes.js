const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

module.exports = router;
