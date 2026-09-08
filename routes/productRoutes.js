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
    upload.single("image"),
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