const { db } = require("../dbCon");

// ================= CREATE RETURN REQUEST =================

const createReturnRequest = (req, res) => {
  const user_id = req.user.id;

  const {
    order_id,
    product_id,
    reason,
    description,
  } = req.body;

  // Validation
  if (!order_id || !product_id || !reason) {
    return res.status(400).json({
      message: "Order, product and return reason are required",
    });
  }

  // Check order + product belongs to logged-in user
  const checkSql = `
    SELECT
      orders.id AS order_id,
      orders.status,
      order_items.product_id,
      order_items.price,
      order_items.quantity
    FROM orders
    INNER JOIN order_items
      ON orders.id = order_items.order_id
    WHERE orders.id = ?
      AND orders.user_id = ?
      AND order_items.product_id = ?
  `;

  db.query(
    checkSql,
    [order_id, user_id, product_id],
    (err, result) => {
      if (err) {
        console.error("Return Check Error:", err);

        return res.status(500).json({
          message: "Database error",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Order or product not found",
        });
      }

      const order = result[0];

      // Return only after delivered
      if (order.status.toLowerCase() !== "delivered") {
        return res.status(400).json({
          message: "Product can only be returned after delivery",
        });
      }

      // Check already requested
      const checkReturnSql = `
        SELECT id, status
        FROM returns
        WHERE order_id = ?
          AND product_id = ?
          AND user_id = ?
      `;

      db.query(
        checkReturnSql,
        [order_id, product_id, user_id],
        (err, existingReturn) => {
          if (err) {
            console.error("Existing Return Check Error:", err);

            return res.status(500).json({
              message: "Database error",
              error: err.message,
            });
          }

          if (existingReturn.length > 0) {
            return res.status(400).json({
              message: "Return request already exists",
              return: existingReturn[0],
            });
          }

          // Calculate refund amount
          const refund_amount =
            Number(order.price) * Number(order.quantity);

          // Create return
          const insertSql = `
            INSERT INTO returns
            (
              order_id,
              product_id,
              user_id,
              reason,
              description,
              status,
              refund_amount
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertSql,
            [
              order_id,
              product_id,
              user_id,
              reason,
              description || null,
              "Return Requested",
              refund_amount,
            ],
            (err, insertResult) => {
              if (err) {
                console.error("Create Return Error:", err);

                return res.status(500).json({
                  message: "Return request failed",
                  error: err.message,
                });
              }

              res.status(201).json({
                message: "Return request submitted successfully",
                return_id: insertResult.insertId,
                status: "Return Requested",
                refund_amount,
              });
            }
          );
        }
      );
    }
  );
};


// ================= GET USER RETURNS =================

const getUserReturns = (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT
      returns.id AS return_id,
      returns.order_id,
      returns.product_id,
      returns.reason,
      returns.description,
      returns.status,
      returns.refund_amount,
      returns.requested_at,
      returns.approved_at,
      returns.completed_at,
      product.product_name,
      product.image
    FROM returns
    INNER JOIN product
      ON returns.product_id = product.id
    WHERE returns.user_id = ?
    ORDER BY returns.requested_at DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Get Returns Error:", err);

      return res.status(500).json({
        message: "Returns fetch failed",
        error: err.message,
      });
    }

    res.status(200).json({
      message: "Returns fetched successfully",
      returns: result,
    });
  });
};


module.exports = {
  createReturnRequest,
  getUserReturns,
};