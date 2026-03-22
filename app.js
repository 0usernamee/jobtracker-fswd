const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const path = require("path");
require("dotenv").config();
const pool = require("./config/db");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        store: new pgSession({ pool, tableName: "session" }),
        secret: process.env.SESSION_SECRET || "supersecretkey",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    }),
);

// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const applicationRoutes = require("./routes/applications");
app.use("/applications", applicationRoutes);

app.get("/dashboard", async (req, res) => {
    try {
        const userId = req.session.userId;

        const statsResult = await pool.query(
            `SELECT
                COUNT(*)::int AS total_applications,
                COUNT(*) FILTER (WHERE status = 'interview')::int AS total_interviews,
                COUNT(*) FILTER (WHERE status = 'offer')::int AS total_offers,
                COUNT(*) FILTER (WHERE status = 'rejected')::int AS total_rejections
             FROM applications
             WHERE user_id = $1`,
            [userId],
        );
        const stats = statsResult.rows[0] || {};

        const recentResult = await pool.query(
            "SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6",
            [userId],
        );

        res.render("dashboard", {
            username: req.session.username || "User",
            totalApplications: stats.total_applications || 0,
            totalInterviews: stats.total_interviews || 0,
            totalOffers: stats.total_offers || 0,
            totalRejections: stats.total_rejections || 0,
            recentApplications: recentResult.rows,
            addError: req.query.addError || null,
            saved: req.query.saved === "1",
            updated: req.query.updated === "1",
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.render("dashboard", {
            username: req.session.username || "User",
            totalApplications: 0,
            totalInterviews: 0,
            totalOffers: 0,
            totalRejections: 0,
            recentApplications: [],
            addError: req.query.addError || null,
            saved: req.query.saved === "1",
            updated: req.query.updated === "1",
        });
    }
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
    res.send("NextStep is running!");
});

if (require.main === module) {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

module.exports = app;
