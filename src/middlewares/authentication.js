const { renderUnlogged } = require('../controllers/services');

function authenticateAPI(req, res, next) {
    if (req.session.handle) return next();
    res.sendStatus(401);
}

async function checkLogInStatus(req, res, next) {
    if (req.session.handle) return next();
    renderUnlogged(req, res);
}

module.exports = {
    authenticateAPI,
    checkLogInStatus,
};
