const router = require('express').Router();
const {
    getCommunityPosts,
    createCommunity,
} = require('../controllers/communities');
const { processBanner } = require('../middlewares/uploads');
const { exceptionHandler } = require('../variables');

router.get('/:name/posts', exceptionHandler(getCommunityPosts));

router.post(
    '/',
    exceptionHandler(processBanner),
    exceptionHandler(createCommunity)
);

module.exports = router;
