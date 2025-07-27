const router = require('express').Router();
const {
    getCommunityFeed,
    getFollowingFeed,
    toggleFollowedCommunity,
} = require('../controllers/users');
const { authenticateAPI } = require('../middlewares/authentication');
const { exceptionHandler } = require('../variables');

router.get(
    '/communityFeed',
    exceptionHandler(authenticateAPI),
    exceptionHandler(getCommunityFeed)
);

router.get(
    '/followingFeed',
    exceptionHandler(authenticateAPI),
    exceptionHandler(getFollowingFeed)
);

router.patch(
    '/followedCommunities',
    exceptionHandler(authenticateAPI),
    exceptionHandler(toggleFollowedCommunity)
);

module.exports = router;
