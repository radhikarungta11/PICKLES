const { User, Community, Post } = require('../models');
const { checkAndParse } = require('../validators/dataTypes');
const bcrypt = require('bcrypt');
const { comparePosts } = require('../utils/program');
const { POST_PAGE_LEN } = require('../variables');

const SALT_ROUNDS = 5;
const NUM_SHOWN_COMM = 10;

async function renderUnlogged(req, res) {
    let recentFeed = null;
    let community = null;
    if (req.url === '/') {
        recentFeed = await Post.find()
            .sort('-createdAt')
            .limit(POST_PAGE_LEN)
            .populate({
                path: 'author',
                select: 'handle',
            })
            .populate({
                path: 'belongsTo',
                select: 'name',
            })
            .exec();
    } else {
        const name = decodeURIComponent(req.url.split('/').pop());
        community = await Community.findOne({ name })
            .slice('addedPosts', [-POST_PAGE_LEN, POST_PAGE_LEN])
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
                options: { sort: '-createdAt' },
            })
            .exec();
        if (!community) return res.sendStatus(404);
    }
    const popularCommunities = await Community.find()
        .select('name banner')
        .sort('-numUsers')
        .limit(NUM_SHOWN_COMM)
        .exec();
    const theme = req.session.theme;
    res.status(200).render('unlogged', {
        recentFeed,
        community,
        popularCommunities,
        theme,
    });
}

async function populateCommunityFeed(communityList, communityFeed) {
    const postsPerComm = Math.ceil(
        (0.5 * POST_PAGE_LEN) / communityList.length
    );
    for (elemCommunity of communityList) {
        const addedPosts = (
            await Community.findOne({ name: elemCommunity.name })
                .select('addedPosts')
                .slice('addedPosts', [-postsPerComm, postsPerComm])
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

async function renderLogged(req, res) {
    const handle = req.session.handle;
    const user = await User.findOne({ handle })
        .select('_id handle avatar followedCommunities createdCommunities')
        .populate({
            path: 'followedCommunities',
            select: '_id name banner',
            options: { sort: '-numUsers' },
        })
        .populate({
            path: 'createdCommunities',
            select: 'name banner',
            options: { sort: '-createdAt' },
        })
        .exec();
    const communityFeed = [];
    let community = null;
    let hasFollowedComm = false;
    let isAdmin = false;
    if (req.url === '/') {
        await populateCommunityFeed(user.createdCommunities, communityFeed);
        await populateCommunityFeed(user.followedCommunities, communityFeed);
        communityFeed.sort(comparePosts);
    } else {
        const name = decodeURIComponent(req.url.split('/').pop());
        community = await Community.findOne({ name })
            .slice('addedPosts', [-POST_PAGE_LEN, POST_PAGE_LEN])
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
                options: { sort: '-createdAt' },
            })
            .exec();
        if (community.admin.equals(user._id)) isAdmin = true;
        else
            for (followedCommunity of user.followedCommunities)
                if (followedCommunity._id.equals(community._id)) {
                    hasFollowedComm = true;
                    break;
                }
        if (!community) return res.sendStatus(404);
    }
    const popularCommunities = await Community.find()
        .select('name banner')
        .sort('-numUsers')
        .limit(NUM_SHOWN_COMM)
        .exec();
    const theme = req.session.theme;
    res.render('logged', {
        user,
        communityFeed,
        community,
        hasFollowedComm,
        isAdmin,
        popularCommunities,
        theme,
    });
}

async function userLogIn(req, res) {
    const handle = req.body.handle.trim();
    const password = req.body.password;
    const constraints = checkAndParse({
        mandatoryArgs: {
            strings: {
                handle,
                password,
            },
        },
    });
    if (!constraints) return res.sendStatus(400);
    const user = await User.findOne({ handle: constraints.handle })
        .select('password')
        .exec();
    if (!user) return res.sendStatus(404);
    if (!(await bcrypt.compare(constraints.password, user.password)))
        return res.sendStatus(401);
    req.session.handle = constraints.handle;
    res.sendStatus(204);
}

async function userSignUp(req, res) {
    const handle = req.body.handle.trim();
    const bio = req.body.bio.trim();
    const { password, avatar } = req.body;
    const input = checkAndParse({
        mandatoryArgs: {
            strings: {
                handle,
                password,
            },
        },
        optionalArgs: {
            strings: {
                bio,
                avatar,
            },
        },
    });
    if (!input) return res.sendStatus(400);
    const user = await User.findOne({ handle: input.handle })
        .select('_id')
        .exec();
    if (user) return res.sendStatus(409);
    input.password = await bcrypt.hash(input.password, SALT_ROUNDS);
    await User.create(input);
    req.session.handle = input.handle;
    res.sendStatus(204);
}

async function userLogOut(req, res) {
    req.session.handle = null;
    res.sendStatus(204);
}

async function setTheme(req, res) {
    const theme = req.body.theme;
    const constraints = checkAndParse({
        mandatoryArgs: {
            booleans: { theme },
        },
    });
    if (!constraints) return res.sendStatus(400);
    req.session.theme = constraints.theme ? 'manual-dark' : 'manual-light';
    res.sendStatus(204);
}

module.exports = {
    renderUnlogged,
    renderLogged,
    userLogIn,
    userSignUp,
    userLogOut,
    setTheme,
};
