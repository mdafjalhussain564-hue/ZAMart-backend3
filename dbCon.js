// const mysql = require("mysql2");

// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "1234",
//     database: "gmart"
// });

// db.connect((err) => {
//     if (err) {
//         console.log("Database connection failed", err);
//     } else {
//         console.log("Database connected successfully");
//     }
// });

// const getConnection = async () => {
//     return db.promise();
// };

// module.exports = db;
// module.exports.getConnection = getConnection;


const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    ssl: {
        rejectUnauthorized: false,
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const getConnection = async () => {
    return db.promise();
};

module.exports = db;
module.exports.getConnection = getConnection;