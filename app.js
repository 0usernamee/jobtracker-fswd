const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

console.log("SESSION_SECRET from env:", process.env.SESSION_SECRET);

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
        secret: process.env.SESSION_SECRET || "supersecretkey",
        resave: false,
        saveUninitialized: false,
    }),
);

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const applicationRoutes = require("./routes/applications");
app.use("/applications", applicationRoutes);

// Dashboard route (auth bypass for dev so UI can be viewed)
app.get("/dashboard", (req, res) => {
    res.render("dashboard", {
        username: req.session.username || "Demo User",
        totalApplications: 0,
        totalInterviews: 0,
        totalOffers: 0,
        totalRejections: 0,
        recentApplications: [],
    });
});

// Test route
app.get("/", (req, res) => {
    res.send("NextStep is running!");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
