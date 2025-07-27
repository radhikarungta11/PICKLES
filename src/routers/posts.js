const router = require('express').Router();
const { getRecentPosts, addPost } = require('../controllers/posts');
const { processPostFile } = require('../middlewares/uploads');
const { exceptionHandler } = require('../variables');

router.get('/recent', exceptionHandler(getRecentPosts));
router.post('/', exceptionHandler(processPostFile), exceptionHandler(addPost));

module.exports = router;
