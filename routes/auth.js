const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

// GET register page
router.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// POST register
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
        );

        if (existingUser.rows.length > 0) {
            return res.render("register", { error: "Email already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
            [username, email, hashedPassword],
        );

        res.redirect("/auth/login");
    } catch (err) {
        console.error(err);
        res.render("register", { error: "Something went wrong" });
    }
});

module.exports = router;
