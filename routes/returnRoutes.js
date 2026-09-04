const express = require("express");

const router = express.Router();

const {
  createReturnRequest,
  getUserReturns,
} = require("../controller/returnController");

const authMiddleware = require("../middleware/authMiddleware");

// Create return
router.post("/", authMiddleware, createReturnRequest);

// Get user's returns
router.get("/", authMiddleware, getUserReturns);

module.exports = router;