const router = require("express").Router();

const {
    getproductservice,
    getsingleproductservice,
    insproductservice,
    updateproductservice,
    deleteproductservice,
    getcategoryproductservice
} = require("../controller/productController");

const upload = require("../middleware/upload");

router.get("/getproduct", getproductservice);

router.get("/getproduct/:id", getsingleproductservice);

router.post(
    "/product",
    (req, res, next) => {
        console.log("🔥 PRODUCT ROUTE HIT 🔥");
        next();
    },
    upload.single("image"),
    (req, res, next) => {
        console.log("🔥 MULTER COMPLETE 🔥");
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);
        next();
    },
    insproductservice
);

router.put(
    "/product/:id",
    upload.single("image"),
    updateproductservice
);

router.delete("/product/:id", deleteproductservice);

router.get(
    "/getproduct/category/:category",
    getcategoryproductservice
);

module.exports = router;