const { User, Community } = require('../models');
const { checkAndParse } = require('../validators/dataTypes');
const { comparePosts } = require('../utils/program');
const { POST_PAGE_LEN } = require('../variables');

async function populateCommunityFeed(communityList, communityFeed, pageNo) {
    const postsPerComm = Math.ceil(
        (0.5 * POST_PAGE_LEN) / communityList.length
    );
    const offset = -pageNo * postsPerComm;
    for (communityId of communityList) {
        const numPosts = (
            await Community.aggregate([
                {
                    $match: { _id: communityId },
                },
                {
                    $project: {
                        numPosts: { $size: '$addedPosts' },
                    },
                },
            ])
        )[0].numPosts;
        const gap = numPosts + offset;
        const effectiveLength =
            gap >= 0 ? postsPerComm : Math.max(0, postsPerComm + gap);
        if (!effectiveLength) continue;
        const addedPosts = (
            await Community.findById(communityId)
                .select('addedPosts')
                .slice('addedPosts', [offset, effectiveLength])
                .populate({
                    path: 'addedPosts',
                    populate: [
                        {
                            path: 'author',
                            select: 'handle',
                        },
                        {
                            path: 'belongsTo',
                            select: 'name',
                        },
                    ],
                })
                .exec()
        ).addedPosts;
        communityFeed.push(...addedPosts);
    }
}

async function getCommunityFeed(req, res) {
    const pageNo = req.query.pageNo;
    const constraint = checkAndParse({
        mandatoryArgs: {
            numbers: { pageNo },
        },
    });
    if (!constraint || constraint.pageNo <= 0) return res.sendStatus(400);
    const handle = req.session.handle;
    const user = await User.findOne({ handle })
        .select('createdCommunities followedCommunities')
        .exec();
    const communityFeed = [];
    await populateCommunityFeed(
        user.createdCommunities,
        communityFeed,
        constraint.pageNo
    );
    await populateCommunityFeed(
        user.followedCommunities,
        communityFeed,
        constraint.pageNo
    );
    communityFeed.sort(comparePosts);
    if (!communityFeed.length) return res.sendStatus(404);
    res.status(200).json(communityFeed);
}

async function getFollowingFeed(req, res) {
    const pageNo = req.query.pageNo;
    const constraint = checkAndParse({
        mandatoryArgs: {
            numbers: { pageNo },
        },
    });
    if (!constraint || constraint.pageNo <= 0) return res.sendStatus(400);
    const handle = req.session.handle;
    const followedUsers = (
        await User.findOne({ handle }).select('followedUsers').exec()
    ).followedUsers;
    const postsPerUser = Math.ceil(POST_PAGE_LEN / followedUsers.length);
    const offset = -constraint.pageNo * postsPerUser;
    const followingFeed = [];
    for (userId of followedUsers) {
        const numPosts = (
            await User.aggregate([
                {
                    $match: { _id: userId },
                },
                {
                    $project: {
                        numPosts: { $size: '$createdPosts' },
                    },
                },
            ])
        )[0].numPosts;
        const gap = numPosts + offset;
        const effectiveLength =
            gap >= 0 ? postsPerUser : Math.max(0, postsPerUser + gap);
        if (!effectiveLength) continue;
        const createdPosts = (
            await User.findById(userId)
                .select('createdPosts')
                .slice('createdPosts', [offset, effectiveLength])
                .populate({
                    path: 'createdPosts',
                    populate: [
                        {
                            path: 'author',
                            select: 'handle',
                        },
                        {
                            path: 'belongsTo',
                            select: 'name',
                        },
                    ],
                    options: { sort: '-createdAt' },
                })
                .exec()
        ).createdPosts;
        followingFeed.push(...createdPosts);
    }
    if (!followingFeed.length) return res.sendStatus(404);
    res.status(200).json(followingFeed);
}

async function toggleFollowedCommunity(req, res) {
    const handle = req.session.handle;
    const name = req.body.name;
    const constraints = checkAndParse({
        mandatoryArgs: {
            strings: { name },
        },
    });
    if (!constraints) return res.sendStatus(400);
    const community = await Community.findOne({ name: constraints.name })
        .select('_id admin numUsers')
        .exec();
    if (!community) return res.sendStatus(404);
    const user = await User.findOne({ handle })
        .select('_id followedCommunities')
        .exec();
    if (community.admin.equals(user._id)) return res.sendStatus(403);
    const communityId = community._id;
    const followedCommunities = user.followedCommunities;
    if (followedCommunities.includes(communityId)) {
        followedCommunities.remove(communityId);
        community.numUsers--;
    } else {
        followedCommunities.push(communityId);
        community.numUsers++;
    }
    await community.save();
    await user.save();
    res.sendStatus(204);
}

module.exports = {
    getCommunityFeed,
    getFollowingFeed,
    toggleFollowedCommunity,
};
