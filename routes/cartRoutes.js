const express = require("express");
const router = express.Router();

const { addToCart, getCart, updateCart, removeFromCart} = require("../controller/cartController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, addToCart);

router.get("/", authMiddleware, getCart);


router.put("/update", authMiddleware, updateCart);

router.delete("/remove", authMiddleware, removeFromCart);

module.exports = router;


