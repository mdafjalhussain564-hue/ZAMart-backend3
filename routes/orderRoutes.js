const express = require("express");
const router = express.Router();

const { createOrder, getOrders, getOrderById } = require("../controller/orderController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;

