const {db }= require("../dbCon");

// ================= ADD TO CART =================
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
      return res.status(400).json({
        message: "product_id required",
      });
    }

    const sql = `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?
    `;

    db.query(
      sql,
      [user_id, product_id, quantity, quantity],
      (err, result) => {
        if (err) {
          console.error("Cart Error:", err);

          return res.status(500).json({
            message: "Database error",
            error: err.message,
          });
        }

        res.status(200).json({
          message: "Product added to cart",
          result,
        });
      }
    );
  } catch (error) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET CART =================
const getCart = (req, res) => {
  console.log("REQ.USER:", req.user);

  const user_id = req.user.id;

  console.log("GET CART USER ID:", user_id);

  const sql = `
    SELECT
      cart.id,
      cart.user_id,
      cart.product_id,
      cart.quantity,
      product.product_name,
      product.price,
      product.image
    FROM cart
    INNER JOIN product
      ON cart.product_id = product.id
    WHERE cart.user_id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Get Cart Error:", err);

      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    console.log("CART RESULT:", result);

    res.status(200).json({
      message: "Cart fetched successfully",
      cart: result,
    });
  });
};

// ================= UPDATE CART =================
const updateCart = (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({
      message: "product_id and quantity are required",
    });
  }

  if (quantity < 1) {
    return res.status(400).json({
      message: "Quantity must be at least 1",
    });
  }

  const sql = `
    UPDATE cart
    SET quantity = ?
    WHERE user_id = ? AND product_id = ?
  `;

  db.query(
    sql,
    [quantity, user_id, product_id],
    (err, result) => {
      if (err) {
        console.error("Update Cart Error:", err);

        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Product not found in cart",
        });
      }

      res.status(200).json({
        message: "Cart quantity updated successfully",
        result,
      });
    }
  );
};

// ================= REMOVE FROM CART =================
const removeFromCart = (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({
      message: "product_id is required",
    });
  }

  const sql = `
    DELETE FROM cart
    WHERE user_id = ? AND product_id = ?
  `;

  db.query(
    sql,
    [user_id, product_id],
    (err, result) => {
      if (err) {
        console.error("Remove Cart Error:", err);

        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Product not found in cart",
        });
      }

      res.status(200).json({
        message: "Product removed from cart",
        result,
      });
    }
  );
};

// ================= EXPORT =================
module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
};