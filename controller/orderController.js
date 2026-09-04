
const {db} = require("../dbCon");

// ================= CREATE ORDER =================

const createOrder = (req, res) => {
  const user_id = req.user.id;
  const { addressId } = req.body;

  // Step 1: Address ID check
  if (!addressId) {
    return res.status(400).json({
      message: "Please select a delivery address",
    });
  }

  // Step 2: Selected address user ka hi hai ya nahi
  const addressSql = `
    SELECT
      id,
      full_name,
      mobile,
      address,
      city,
      state,
      pincode
    FROM addresses
    WHERE id = ? AND user_id = ?
  `;

  db.query(addressSql, [addressId, user_id], (err, addressResult) => {
    if (err) {
      console.error("Address Error:", err);

      return res.status(500).json({
        message: "Address fetch failed",
        error: err.message,
      });
    }

    if (addressResult.length === 0) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    const selectedAddress = addressResult[0];

    // Step 3: User ka cart nikalo
    const cartSql = `
      SELECT
        cart.product_id,
        cart.quantity,
        product.price
      FROM cart
      INNER JOIN product
        ON cart.product_id = product.id
      WHERE cart.user_id = ?
    `;

    db.query(cartSql, [user_id], (err, cartItems) => {
      if (err) {
        console.error("Cart Error:", err);

        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      // Cart empty
      if (cartItems.length === 0) {
        return res.status(400).json({
          message: "Cart is empty",
        });
      }

      // Step 4: Total calculate
      let total_amount = 0;

      cartItems.forEach((item) => {
        total_amount +=
          Number(item.price) * Number(item.quantity);
      });

      // Step 5: Order create with delivery address
      const orderSql = `
        INSERT INTO orders
        (
          user_id,
          total_amount,
          delivery_name,
          delivery_mobile,
          delivery_address,
          delivery_city,
          delivery_state,
          delivery_pincode
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        orderSql,
        [
          user_id,
          total_amount,
          selectedAddress.full_name,
          selectedAddress.mobile,
          selectedAddress.address,
          selectedAddress.city,
          selectedAddress.state,
          selectedAddress.pincode,
        ],
        (err, orderResult) => {
          if (err) {
            console.error("Order Error:", err);

            return res.status(500).json({
              message: "Order creation failed",
              error: err.message,
            });
          }

          const order_id = orderResult.insertId;

          // Step 6: Order items prepare
          const values = cartItems.map((item) => [
            order_id,
            item.product_id,
            item.quantity,
            item.price,
          ]);

          const itemSql = `
            INSERT INTO order_items
            (order_id, product_id, quantity, price)
            VALUES ?
          `;

          db.query(itemSql, [values], (err) => {
            if (err) {
              console.error("Order Items Error:", err);

              return res.status(500).json({
                message: "Order items creation failed",
                error: err.message,
              });
            }

            // Step 7: Cart empty
            const deleteCartSql = `
              DELETE FROM cart
              WHERE user_id = ?
            `;

            db.query(
              deleteCartSql,
              [user_id],
              (err) => {
                if (err) {
                  console.error("Cart Delete Error:", err);

                  return res.status(500).json({
                    message: "Order created but cart clear failed",
                    error: err.message,
                  });
                }

                // Final response
                res.status(201).json({
                  message: "Order placed successfully",
                  order_id,
                  total_amount,
                  delivery_address: {
                    name: selectedAddress.full_name,
                    mobile: selectedAddress.mobile,
                    address: selectedAddress.address,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode,
                  },
                });
              }
            );
          });
        }
      );
    });
  });
};

// ================= GET ALL ORDERS =================

const getOrders = (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT
      orders.id AS order_id,
      orders.total_amount,
      orders.status,
      orders.created_at,
      order_items.product_id,
      order_items.quantity,
      order_items.price,
      product.product_name,
      product.image
    FROM orders
    INNER JOIN order_items
      ON orders.id = order_items.order_id
    INNER JOIN product
      ON order_items.product_id = product.id
    WHERE orders.user_id = ?
    ORDER BY orders.created_at DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Get Orders Error:", err);

      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    res.status(200).json({
      message: "Orders fetched successfully",
      orders: result,
    });
  });
};


// ================= GET ORDER BY ID =================

const getOrderById = (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  const sql = `
    SELECT
      orders.id AS order_id,
      orders.user_id,
      orders.total_amount,
      orders.status,
      orders.created_at,
      order_items.product_id,
      order_items.quantity,
      order_items.price,
      product.product_name,
      product.image
    FROM orders
    INNER JOIN order_items
      ON orders.id = order_items.order_id
    INNER JOIN product
      ON order_items.product_id = product.id
    WHERE orders.id = ?
      AND orders.user_id = ?
  `;

  db.query(sql, [id, user_id], (err, result) => {
    if (err) {
      console.error("Get Order Error:", err);

      return res.status(500).json({
        message: "Database error",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order: result,
    });
  });
};


// ================= EXPORT =================

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
};


// ================= ADMIN: GET ALL ORDERS =================

const getAllOrdersAdmin = (req, res) => {
  const sql = `
    SELECT
      orders.id AS order_id,
      orders.user_id,

      orders.delivery_name,
      orders.delivery_mobile,
      orders.delivery_address,
      orders.delivery_city,
      orders.delivery_state,
      orders.delivery_pincode,

      orders.total_amount,
      orders.status,

      orders.payment_status,
      orders.payment_method,
      orders.payment_id,

      orders.created_at,

      order_items.product_id,
      order_items.quantity,
      order_items.price,

      product.product_name,
      product.image

    FROM orders

    INNER JOIN order_items
      ON orders.id = order_items.order_id

    INNER JOIN product
      ON order_items.product_id = product.id

    ORDER BY orders.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Admin Get Orders Error:", err);

      return res.status(500).json({
        message: "Orders fetch failed",
        error: err.message,
      });
    }

    res.status(200).json({
      message: "All orders fetched successfully",
      orders: result,
    });
  });
};



module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrdersAdmin,
};





