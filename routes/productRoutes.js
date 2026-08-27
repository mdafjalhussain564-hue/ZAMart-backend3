const router = require('express').Router();

const {getproductservice,getsingleproductservice,insproductservice,updateproductservice,deleteproductservice,getcategoryproductservice} = require('../controller/productController');

router.get('/getproduct', getproductservice);
router.get("/getproduct/:id", getsingleproductservice);
router.post('/product', insproductservice);
router.put("/product/:id", updateproductservice);
router.delete("/product/:id", deleteproductservice);
router.get("/getproduct/category/:category", getcategoryproductservice);
module.exports = router;

// Order Status + Admin Orders Management banate hain:



//Test API Key= rzp_test_TSMLX5fcGJ2LlP
//Test Key Secret= kigRFdlTt2lrkgbBSOEJfmN5