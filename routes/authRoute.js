const router = require("express").Router();

const {
    registerUser,
    sendOtp,
    verifyOtp,
    loginUser,
    getUsers,
    updateUser,
    deleteUser,
    getProfile
} = require("../controller/authController");

const authMiddleware = require("../middleware/authMiddleware");


router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/users", getUsers);

router.put("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);


router.get("/profile", authMiddleware, getProfile);

module.exports = router;

