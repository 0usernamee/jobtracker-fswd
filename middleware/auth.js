const isAuthenticated = (req, res, next) => {
    // DEV ONLY: bypass real authentication so you can work on UI
    // Restore the real check before submitting the project.
    req.session.userId = req.session.userId || 1;
    req.session.username = req.session.username || "Demo User";
    next();
};

module.exports = isAuthenticated;
