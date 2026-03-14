const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }),
);

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Dashboard route
const isAuthenticated = require("./middleware/auth");
app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard", { username: req.session.username });
});

// Test route
app.get("/", (req, res) => {
    res.send("Job Tracker is running!");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
