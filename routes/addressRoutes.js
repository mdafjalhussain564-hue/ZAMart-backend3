const express = require("express");

const router = express.Router();

const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require("../controller/addressController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/address", authMiddleware, addAddress);

router.get("/address", authMiddleware, getAddresses);

router.put("/address/:id", authMiddleware, updateAddress);

router.delete("/address/:id", authMiddleware, deleteAddress);

module.exports = router;



