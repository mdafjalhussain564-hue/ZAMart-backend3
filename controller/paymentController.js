const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      message: "Razorpay order created",
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);

    res.status(500).json({
      message: "Payment order creation failed",
      error: error.message,
    });
  }
};


const crypto = require("crypto");

const verifyPayment = async (req, res) => {
  try {
    console.log("VERIFY BODY:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details missing",
      });
    }

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    console.log("EXPECTED SIGNATURE:", expectedSignature);
    console.log("RAZORPAY SIGNATURE:", razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createPaymentOrder,
  verifyPayment,
};