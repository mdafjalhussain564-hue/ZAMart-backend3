const router = require("express").Router();

const {
    registerAdmin,
    loginAdmin
} = require("../controller/adminController");



router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

module.exports = router;

