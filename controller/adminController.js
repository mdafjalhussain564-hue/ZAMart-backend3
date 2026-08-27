const db = require("../dbCon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const sql = "SELECT * FROM admin_users WHERE email = ?";

        db.query(sql, [email], async (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Admin already exists"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql = `
                INSERT INTO admin_users (name, email, password, type)
                VALUES (?, ?, ?, 'admin')
            `;

            db.query(
                insertSql,
                [name, email, hashedPassword],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Admin registration failed"
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Admin registered successfully",
                        admin: {
                            id: result.insertId,
                            name,
                            email,
                           
                        }
                    });
                }
            );
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerAdmin
};


const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find admin
        const sql = "SELECT * FROM admin_users WHERE email = ?";

        db.query(sql, [email], async (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            // Admin not found
            if (result.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const admin = result[0];

            // Check password
            const isPasswordMatch = await bcrypt.compare(
                password,
                admin.password
            );

            if (!isPasswordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            // Check admin type
            if (admin.type !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Create JWT token
            const token = jwt.sign(
                {
                    id: admin.id,
                    email: admin.email,
                    type: admin.type
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            // Success response
            res.status(200).json({
                success: true,
                message: "Admin login successful",

                token,

                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    type: admin.type
                }
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    registerAdmin,
    loginAdmin
};

