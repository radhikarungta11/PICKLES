const router = require('express').Router();
const communitiesRouter = require('./communites');
const postsRouter = require('./posts');
const usersRouter = require('./users');

router.use('/communities', communitiesRouter);
router.use('/posts', postsRouter);
router.use('/users', usersRouter);

module.exports = router;
