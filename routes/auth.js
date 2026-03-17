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
        console.error("Register error:", err);
        res.render("register", { error: err.message || "Something went wrong" });
    }
});

// GET login page
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// POST login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
        );

        if (result.rows.length === 0) {
            return res.render("login", { error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Compare password with bcrypt
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render("login", { error: "Invalid email or password" });
        }

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Login error:", err);
        res.render("login", { error: err.message || "Something went wrong" });
    }
});

// GET logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect("/auth/login");
    });
});

module.exports = router;
