const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const isAuthenticated = require("../middleware/auth");

router.use(isAuthenticated);

// List all applications for logged-in user
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC",
            [req.session.userId]
        );
        res.render("applications", { applications: result.rows, username: req.session.username });
    } catch (err) {
        console.error(err);
        res.render("applications", { applications: [], username: req.session.username });
    }
});

// Show add form
router.get("/add", (req, res) => {
    res.render("add-application", { error: null });
});

// Create new application
router.post("/", async (req, res) => {
    const { company, position, job_link, date_applied } = req.body;
    try {
        await pool.query(
            "INSERT INTO applications (user_id, company, position, job_link, date_applied) VALUES ($1, $2, $3, $4, $5)",
            [req.session.userId, company, position, job_link || null, date_applied || null]
        );
        res.redirect("/applications");
    } catch (err) {
        console.error(err);
        res.render("add-application", { error: "Failed to add application" });
    }
});

// Show edit form
router.get("/:id/edit", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
            [req.params.id, req.session.userId]
        );
        if (result.rows.length === 0) {
            return res.redirect("/applications");
        }
        res.render("edit-application", { application: result.rows[0], error: null });
    } catch (err) {
        console.error(err);
        res.redirect("/applications");
    }
});

// Update application
router.post("/:id/edit", async (req, res) => {
    const { company, position, job_link, date_applied } = req.body;
    try {
        await pool.query(
            "UPDATE applications SET company = $1, position = $2, job_link = $3, date_applied = $4 WHERE id = $5 AND user_id = $6",
            [company, position, job_link || null, date_applied || null, req.params.id, req.session.userId]
        );
        res.redirect("/applications");
    } catch (err) {
        console.error(err);
        res.render("edit-application", {
            application: { id: req.params.id, company, position, job_link, date_applied },
            error: "Failed to update application"
        });
    }
});

// Delete application
router.post("/:id/delete", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM applications WHERE id = $1 AND user_id = $2",
            [req.params.id, req.session.userId]
        );
    } catch (err) {
        console.error(err);
    }
    res.redirect("/applications");
});

module.exports = router;
