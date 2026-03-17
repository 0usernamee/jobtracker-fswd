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

const applicationRoutes = require("./routes/applications");
app.use("/applications", applicationRoutes);

// Dashboard route
const isAuthenticated = require("./middleware/auth");
app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard", { username: req.session.username });
});

// Demo route — bypasses auth with fake data for testing
app.get("/demo", (req, res) => {
    const demoApplications = [
        { id: 1, company: "Google", position: "Software Engineer", job_link: "https://google.com", date_applied: new Date(), status: "applied", applied_note: "Submitted through careers page", interview_note: "", offer_note: "" },
        { id: 2, company: "Apple", position: "Frontend Developer", job_link: "https://apple.com", date_applied: new Date(), status: "interview", applied_note: "Referral from John", interview_note: "Phone screen scheduled for Friday", offer_note: "" },
        { id: 3, company: "Netflix", position: "Full Stack Dev", job_link: "https://netflix.com", date_applied: new Date(), status: "offer", applied_note: "", interview_note: "3 rounds completed", offer_note: "120k base + equity" },
        { id: 4, company: "Meta", position: "UI Engineer", job_link: "https://meta.com", date_applied: new Date(), status: "rejected", applied_note: "Applied online", interview_note: "", offer_note: "" },
    ];
    res.render("applications", { applications: demoApplications, username: "DemoUser" });
});

// Test route
app.get("/", (req, res) => {
    res.send("Job Tracker is running!");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
