const { User, Community, Post } = require('../models');
const { checkAndParse } = require('../validators/dataTypes');
const { POST_PAGE_LEN } = require('../variables');

async function getRecentPosts(req, res) {
    const pageNo = req.query.pageNo;
    const constraint = checkAndParse({
        mandatoryArgs: {
            numbers: { pageNo },
        },
    });
    if (!constraint || constraint.pageNo <= 0) return res.sendStatus(400);
    const posts = await Post.find()
        .sort('-createdAt')
        .skip((pageNo - 1) * POST_PAGE_LEN)
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
    if (!posts.length) return res.sendStatus(404);
    res.status(200).json(posts);
}

async function addPost(req, res) {
    const handle = req.session.handle;
    const title = req.body.title.trim();
    const communityName = req.body.communityName.trim();
    const file = req.body.file;
    const input = checkAndParse({
        mandatoryArgs: {
            strings: {
                title,
                file,
            },
        },
    });
    const constraints = checkAndParse({
        mandatoryArgs: {
            strings: { communityName },
        },
    });
    if (!input || !constraints) return res.sendStatus(400);
    const community = await Community.findOne({
        name: constraints.communityName,
    })
        .select('_id addedPosts')
        .exec();
    if (!community) return res.sendStatus(404);
    const user = await User.findOne({ handle })
        .select('_id createdPosts')
        .exec();
    input.author = user._id;
    input.belongsTo = community._id;
    const post = await Post.create(input);
    user.createdPosts.push(post._id);
    community.addedPosts.push(post._id);
    await user.save();
    await community.save();
    res.sendStatus(204);
}

module.exports = {
    getRecentPosts,
    addPost,
};
