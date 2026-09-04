const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

const authRoute = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const returnRoutes = require("./routes/returnRoutes");
const addressRoutes = require("./routes/addressRoutes");
const apiRouter = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api", authRoute);
app.use("/api", adminRoutes);
app.use("/api",apiRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api", addressRoutes);
app.use("/api/payment", paymentRoutes);


app.listen(3003, () => {
    console.log("Server Running on port 3003");
});



