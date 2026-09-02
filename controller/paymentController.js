// const Razorpay = require("razorpay");
// const {db} = require("../dbCon");

// console.log("PAYMENT DB TYPE:", typeof db);
// console.log("PAYMENT DB QUERY TYPE:", typeof db.query);

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const createPaymentOrder = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount) {
//       return res.status(400).json({
//         message: "Amount is required",
//       });
//     }

//     const options = {
//       amount: Math.round(amount * 100),
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     res.status(200).json({
//       message: "Razorpay order created",
//       order,
//       key: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (error) {
//     console.error("RAZORPAY ERROR:", error);

//     res.status(500).json({
//       message: "Payment order creation failed",
//       error: error.message,
//     });
//   }
// };


// const crypto = require("crypto");

// const verifyPayment = async (req, res) => {
//   try {
//     console.log("VERIFY BODY:", req.body);

//     const {
//       order_id,
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     if (
//       !order_id ||
//       !razorpay_order_id ||
//       !razorpay_payment_id ||
//       !razorpay_signature
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment details missing",
//       });
//     }

//     // Razorpay signature verify
//     const body =
//       razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac(
//         "sha256",
//         process.env.RAZORPAY_KEY_SECRET
//       )
//       .update(body)
//       .digest("hex");

//     console.log("EXPECTED SIGNATURE:", expectedSignature);
//     console.log("RAZORPAY SIGNATURE:", razorpay_signature);

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature",
//       });
//     }

//     // Payment successful → Database update
//     const updateSql = `
//       UPDATE orders
//       SET
//         payment_status = ?,
//         payment_method = ?,
//         payment_id = ?
//       WHERE id = ?
//     `;

//     db.query(
//       updateSql,
//       [
//         "paid",
//         "Razorpay",
//         razorpay_payment_id,
//         order_id,
//       ],
//       (err, result) => {
//         if (err) {
//           console.error("Payment DB Update Error:", err);

//           return res.status(500).json({
//             success: false,
//             message: "Payment verified but order update failed",
//             error: err.message,
//           });
//         }

//         if (result.affectedRows === 0) {
//           return res.status(404).json({
//             success: false,
//             message: "Order not found",
//           });
//         }

//         return res.status(200).json({
//           success: true,
//           message: "Payment verified and order updated successfully",
//           payment_status: "paid",
//           payment_method: "Razorpay",
//           payment_id: razorpay_payment_id,
//         });
//       }
//     );

//   } catch (error) {
//     console.error("VERIFY ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// module.exports = {
//   createPaymentOrder,
//   verifyPayment,
// };


const Razorpay = require("razorpay");
const crypto = require("crypto");
const { getConnection } = require("../dbCon");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= CREATE RAZORPAY ORDER =================

const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
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

// ================= VERIFY PAYMENT =================

const verifyPayment = async (req, res) => {
  try {
    console.log("VERIFY BODY:", req.body);

    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ================= CHECK DATA =================

    if (
      !order_id ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details missing",
      });
    }

    // ================= VERIFY RAZORPAY SIGNATURE =================

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    console.log(
      "EXPECTED SIGNATURE:",
      expectedSignature
    );

    console.log(
      "RAZORPAY SIGNATURE:",
      razorpay_signature
    );

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // ================= DATABASE UPDATE =================

    const updateSql = `
      UPDATE orders
      SET
        payment_status = ?,
        payment_method = ?,
        payment_id = ?
      WHERE id = ?
    `;

    const connection = await getConnection();

    const [result] = await connection.query(
      updateSql,
      [
        "paid",
        "Razorpay",
        razorpay_payment_id,
        order_id,
      ]
    );

    console.log(
      "PAYMENT DB UPDATE RESULT:",
      result
    );

    // ================= ORDER NOT FOUND =================

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ================= SUCCESS =================

    return res.status(200).json({
      success: true,
      message:
        "Payment verified and order updated successfully",
      payment_status: "paid",
      payment_method: "Razorpay",
      payment_id: razorpay_payment_id,
    });

  } catch (error) {
    console.error(
      "VERIFY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= EXPORT =================

module.exports = {
  createPaymentOrder,
  verifyPayment,
};