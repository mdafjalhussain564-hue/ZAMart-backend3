const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "gmart"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed", err);
    } else {
        console.log("Database connected successfully");
    }
});

const getConnection = async () => {
    return db.promise();
};

module.exports = db;
module.exports.getConnection = getConnection;