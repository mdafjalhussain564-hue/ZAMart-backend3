const express = require("express");
const router = express.Router();

const { createOrder, getOrders, getOrderById, getAllOrdersAdmin} = require("../controller/orderController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/orders", authMiddleware, getAllOrdersAdmin);
router.get("/:id", authMiddleware, getOrderById);


module.exports = router;

