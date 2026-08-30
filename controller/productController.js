const { response } = require("express");
const { getConnection } = require("../dbCon")


module.exports = {
    getproductservice: async (req, res) => {
        const Connection = await getConnection();
        try {
            const [datarow, datafiled] = await Connection.execute("SELECT * FROM product");
            console.log(datarow);
            return res.status(200).json({
                success: true,
                message: "Data get successfully",
                data: datarow

            });
        } catch (error) {

        }
    },


    insproductservice: async (req, res) => {
        const Connection = await getConnection();

        try {
            const {
                product_name,
                description,
                mrp,
                price,
                image,
                rating,
                brand,
                category,
                visible,
            } = req.body;

            const [result] = await Connection.execute(
                `INSERT INTO product
      (product_name, description, mrp, price, image, rating, brand, category, visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    product_name,
                    description,
                    mrp,
                    price,
                    image,
                    rating,
                    brand,
                    category,
                    visible,
                ]
            );

            return res.status(201).json({
                success: true,
                message: "Product inserted successfully",
                data: result,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    updateproductservice: async (req, res) => {
        const Connection = await getConnection();

        try {
            const { id } = req.params;

            const {
                product_name,
                description,
                mrp,
                price,
                image,
                rating,
                brand,
                category,
                visible
            } = req.body;

            const sql = `
      UPDATE product
      SET
        product_name = ?,
        description = ?,
        mrp = ?,
        price = ?,
        image = ?,
        rating = ?,
        brand = ?,
        category = ?,
        visible = ?
      WHERE id = ?
    `;

            const [result] = await Connection.execute(sql, [
                product_name,
                description,
                mrp,
                price,
                image,
                rating,
                brand,
                category,
                visible,
                id
            ]);

            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteproductservice: async (req, res) => {
        const Connection = await getConnection();

        try {
            const { id } = req.params;

            const [result] = await Connection.execute(
                "DELETE FROM product WHERE id = ?",
                [id]
            );

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },


    getsingleproductservice: async (req, res) => {
        try {
            const Connection = await getConnection();

            const { id } = req.params;

            const [rows] = await Connection.execute(
                "SELECT * FROM product WHERE id = ?",
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0],
            });

        } catch (error) {
            console.error("Get Single Product Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },






    getcategoryproductservice: async (req, res) => {
        const Connection = await getConnection();

        try {

            const { category } = req.params;

            const [rows] = await Connection.execute(
                `SELECT * FROM product
                 WHERE category = ?
                 AND visible = 1`,
                [category]
            );

            return res.status(200).json({
                success: true,
                message: "Category products get successfully",
                data: rows
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

}

