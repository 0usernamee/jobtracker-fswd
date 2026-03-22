const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// List all applications for logged-in user
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC",
            [req.session.userId || 1]
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

// Save note for current application stage (dashboard AJAX)
router.post("/:id/note", async (req, res) => {
    const note = req.body.note === undefined ? null : String(req.body.note);
    const userId = req.session.userId || 1;
    try {
        const result = await pool.query(
            "SELECT status FROM applications WHERE id = $1 AND user_id = $2",
            [req.params.id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, error: "Not found" });
        }
        const st = result.rows[0].status || "applied";
        let field = "applied_note";
        if (st === "interview") field = "interview_note";
        else if (st === "offer") field = "offer_note";
        else if (st === "applied") field = "applied_note";
        else field = "applied_note";

        await pool.query(
            `UPDATE applications SET ${field} = $1 WHERE id = $2 AND user_id = $3`,
            [note || null, req.params.id, userId]
        );
        if (req.get("Accept") && req.get("Accept").includes("application/json")) {
            return res.json({ ok: true });
        }
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        if (req.get("Accept") && req.get("Accept").includes("application/json")) {
            return res.status(500).json({ ok: false });
        }
        res.redirect("/dashboard");
    }
});

// Show initial status form after creating an application
router.get("/:id/setup-status", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
            [req.params.id, req.session.userId || 1]
        );

        if (result.rows.length === 0) {
            return res.redirect("/applications");
        }

        res.render("setup-application-status", { application: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.redirect("/applications");
    }
});

// Create new application
router.post("/", async (req, res) => {
    const { company, job_link, date_applied, status } = req.body;
    const position = (req.body.position || "").trim();
    const statusNorm = (status || "applied").toLowerCase();
    const allowed = ["applied", "interview", "offer", "rejected", "cancelled"];
    const safeStatus = allowed.includes(statusNorm) ? statusNorm : "applied";

    if (!company || !position) {
        const msg = "Company and role are required.";
        if (req.body.form_source === "dashboard") {
            return res.redirect(`/dashboard?addError=${encodeURIComponent(msg)}`);
        }
        return res.render("add-application", { error: msg });
    }

    try {
        const result = await pool.query(
            "INSERT INTO applications (user_id, company, position, job_link, date_applied, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [req.session.userId || 1, company, position, job_link || null, date_applied || null, safeStatus]
        );
        if (req.body.form_source === "dashboard") {
            return res.redirect("/dashboard?saved=1");
        }
        res.redirect(`/applications/${result.rows[0].id}/setup-status`);
    } catch (err) {
        console.error("Add application error:", err);
        const msg = err.message || "Failed to add application";
        if (req.body.form_source === "dashboard") {
            return res.redirect(`/dashboard?addError=${encodeURIComponent(msg)}`);
        }
        res.render("add-application", { error: msg });
    }
});

// Show edit form
router.get("/:id/edit", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
            [req.params.id, req.session.userId || 1]
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
    const position = (req.body.position || "").trim();
    const { company, job_link, date_applied, status } = req.body;
    const userId = req.session.userId || 1;
    const allowed = ["applied", "interview", "offer", "rejected", "cancelled"];
    let safeStatus = "applied";
    try {
        const cur = await pool.query("SELECT status FROM applications WHERE id = $1 AND user_id = $2", [
            req.params.id,
            userId,
        ]);
        safeStatus = cur.rows[0]?.status || "applied";
        if (status !== undefined && String(status).trim() !== "") {
            const statusNorm = String(status).toLowerCase();
            if (allowed.includes(statusNorm)) safeStatus = statusNorm;
        }
        await pool.query(
            "UPDATE applications SET company = $1, position = $2, job_link = $3, date_applied = $4, status = $5 WHERE id = $6 AND user_id = $7",
            [company, position, job_link || null, date_applied || null, safeStatus, req.params.id, userId]
        );
        if (req.get("Accept") && req.get("Accept").includes("application/json")) {
            return res.json({ ok: true });
        }
        if (req.body.form_source === "dashboard") {
            return res.redirect("/dashboard?updated=1");
        }
        res.redirect("/applications");
    } catch (err) {
        console.error(err);
        if (req.get("Accept") && req.get("Accept").includes("application/json")) {
            return res.status(500).json({ ok: false });
        }
        res.render("edit-application", {
            application: { id: req.params.id, company, position, job_link, date_applied },
            error: "Failed to update application"
        });
    }
});

// Update application status
router.post("/:id/status", async (req, res) => {
    const { status, applied_note, interview_note, offer_note } = req.body;
    const statusNorm = (status || "applied").toLowerCase();
    const allowed = ["applied", "interview", "offer", "rejected", "cancelled"];
    const safeStatus = allowed.includes(statusNorm) ? statusNorm : "applied";
    try {
        await pool.query(
            "UPDATE applications SET status = $1, applied_note = $2, interview_note = $3, offer_note = $4 WHERE id = $5 AND user_id = $6",
            [safeStatus, applied_note || null, interview_note || null, offer_note || null, req.params.id, req.session.userId || 1]
        );
        if (req.get("Accept") && req.get("Accept").includes("application/json")) {
            return res.json({ ok: true, status: safeStatus });
        }
        if (req.body.form_source === "dashboard") {
            return res.redirect("/dashboard");
        }
        res.redirect("/applications");
    } catch (err) {
        console.error(err);
        if (req.get("Accept") && req.get("Accept").includes("application/json")) {
            return res.status(500).json({ ok: false });
        }
        res.redirect("/applications");
    }
});

// Delete application
router.post("/:id/delete", async (req, res) => {
    const wantsJson = req.get("Accept") && req.get("Accept").includes("application/json");
    try {
        await pool.query(
            "DELETE FROM applications WHERE id = $1 AND user_id = $2",
            [req.params.id, req.session.userId || 1]
        );
        if (wantsJson) return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        if (wantsJson) return res.status(500).json({ ok: false });
        return res.redirect("/applications");
    }
    res.redirect("/applications");
});

module.exports = router;
