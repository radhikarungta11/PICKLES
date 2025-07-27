const router = require('express').Router();
const { checkLogInStatus } = require('../middlewares/authentication');
const {
    renderLogged,
    userLogIn,
    userSignUp,
    userLogOut,
    setTheme,
} = require('../controllers/services');
const { processAvatar } = require('../middlewares/uploads');
const { exceptionHandler } = require('../variables');

router.get(
    ['/', '/c/:name'],
    exceptionHandler(checkLogInStatus),
    exceptionHandler(renderLogged)
);

router.post('/auth/login', exceptionHandler(userLogIn));
router.post(
    '/auth/signup',
    exceptionHandler(processAvatar),
    exceptionHandler(userSignUp)
);

router.delete('/auth/logout', exceptionHandler(userLogOut));

router.patch('/settings/theme', exceptionHandler(setTheme));

module.exports = router;
