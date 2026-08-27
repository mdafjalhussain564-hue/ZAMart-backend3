
const db = require("../dbCon");

// Add Address
const addAddress = (req, res) => {
  const userId = req.user.id;

  const {
    full_name,
    mobile,
    address,
    city,
    state,
    pincode,
    is_default,
  } = req.body;

  if (
    !full_name ||
    !mobile ||
    !address ||
    !city ||
    !state ||
    !pincode
  ) {
    return res.status(400).json({
      success: false,
      message: "All address fields are required",
    });
  }

  const sql = `
    INSERT INTO addresses
    (user_id, full_name, mobile, address, city, state, pincode, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      userId,
      full_name,
      mobile,
      address,
      city,
      state,
      pincode,
      is_default || 0,
    ],
    (err, result) => {
      if (err) {
        console.error("ADD ADDRESS ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to add address",
        });
      }

      res.status(201).json({
        success: true,
        message: "Address added successfully",
        addressId: result.insertId,
      });
    }
  );
};

// Get Addresses
const getAddresses = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT *
    FROM addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("GET ADDRESS ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to get addresses",
      });
    }

    res.status(200).json({
      success: true,
      addresses: result,
    });
  });
};

// Update Address
const updateAddress = (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  const {
    full_name,
    mobile,
    address,
    city,
    state,
    pincode,
    is_default,
  } = req.body;

  const sql = `
    UPDATE addresses
    SET
      full_name = ?,
      mobile = ?,
      address = ?,
      city = ?,
      state = ?,
      pincode = ?,
      is_default = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(
    sql,
    [
      full_name,
      mobile,
      address,
      city,
      state,
      pincode,
      is_default || 0,
      addressId,
      userId,
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE ADDRESS ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to update address",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Address updated successfully",
      });
    }
  );
};

// Delete Address
const deleteAddress = (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  const sql = `
    DELETE FROM addresses
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [addressId, userId], (err, result) => {
    if (err) {
      console.error("DELETE ADDRESS ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to delete address",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  });
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};