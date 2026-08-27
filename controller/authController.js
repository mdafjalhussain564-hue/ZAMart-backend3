const db = require("../dbCon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// OTP Store
const otpStore = {};


// Send OTP
const sendOtp = (req, res) => {

    const { mobile_no } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[mobile_no] = otp;

    console.log("OTP:", otp);


    res.json({
        success: true,
        message: "OTP sent successfully"
    });
};


// Verify OTP
const verifyOtp = (req, res) => {

    const { mobile_no, otp } = req.body;


    if (otpStore[mobile_no] == otp) {

        delete otpStore[mobile_no];

        return res.json({
            success: true,
            message: "OTP Verified"
        });

    }


    res.status(400).json({
        success: false,
        message: "Invalid OTP"
    });

};



// Register User
const registerUser = async (req, res) => {

    const {
        name,
        email,
        password,
        mobile,
        address,
        city,
        state,
        pincode
    } = req.body;


    // Required field validation
    if (
        !name ||
        !email ||
        !password ||
        !mobile ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }


    //  Name validation
    if (!/^[A-Za-z ]{2,50}$/.test(name.trim())) {
        return res.status(400).json({
            success: false,
            message: "Name must contain only letters and spaces"
        });
    }


    //  Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email"
        });
    }


    //  Password validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }


    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid 10 digit mobile number"
        });
    }


    // Pincode validation
    if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
            success: false,
            message: "Pincode must be 6 digits"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    //  SQL INSERT
    const sql = `
        INSERT INTO users
        (name, email, password, mobile, address, city, state, pincode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        mobile,
        address.trim(),
        city.trim(),
        state.trim(),
        pincode
    ];


    db.query(sql, values, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Registration failed"
            });
        }


        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            id: result.insertId
        });

    });

};

module.exports = {
    sendOtp,
    verifyOtp,
    registerUser
};



//bcrypt login
const loginUser = (req, res) => {

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Login failed"
            });
        }

        // User nahi mila
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = result[0];

        // Password check
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // JWT Token generate
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            }
        });

    });
};



module.exports = {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser
};





const getUsers = (req, res) => {

    const sql = "SELECT * FROM users";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Users get failed"
            });
        }

        res.json({
            success: true,
            message: "Users fetched successfully",
            data: result
        });
    });
};


module.exports = {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    getUsers
};


const updateUser = async (req, res) => {

    const { id } = req.params;

    const {
        name,
        email,
        password,
        mobile,
        address,
        city,
        state,
        pincode
    } = req.body;


    // ID validation
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Valid user ID is required"
        });
    }


    // Required fields validation
    if (
        !name ||
        !email ||
        !password ||
        !mobile ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }


    // Name validation
    if (!/^[A-Za-z ]{2,50}$/.test(name.trim())) {
        return res.status(400).json({
            success: false,
            message: "Invalid name"
        });
    }


    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email"
        });
    }


    // Password validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }


    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        return res.status(400).json({
            success: false,
            message: "Invalid mobile number"
        });
    }


    // Pincode validation
    if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
            success: false,
            message: "Invalid pincode"
        });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const sql = `
        UPDATE users
        SET
            name = ?,
            email = ?,
            password = ?,
            mobile = ?,
            address = ?,
            city = ?,
            state = ?,
            pincode = ?
        WHERE id = ?
    `;


    const values = [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        mobile,
        address.trim(),
        city.trim(),
        state.trim(),
        pincode,
        id
    ];


    db.query(sql, values, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "User update failed"
            });
        }


        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        return res.json({
            success: true,
            message: "User updated successfully"
        });

    });

};



module.exports = {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    getUsers,
    updateUser
};





const deleteUser = (req, res) => {

    const { id } = req.params;

    // ID validation
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Valid user ID is required"
        });
    }

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "User delete failed"
            });
        }

        // ID database me nahi mili
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            message: "User deleted successfully"
        });

    });
};


module.exports = {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    getUsers,
    updateUser,
    deleteUser
};


// const getProfile = (req, res) => {

//     return res.status(200).json({
//         success: true,
//         message: "Profile fetched successfully",
//         user: req.user
//     });

// };


const getProfile = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT 
            id,
            name,
            email,
            mobile,
            address,
            city,
            state,
            pincode
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Profile fetch failed"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user: result[0]
        });

    });
};



module.exports = {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    getUsers,
    updateUser,
    deleteUser,
    getProfile
};