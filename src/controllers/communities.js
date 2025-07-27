const { User, Community } = require('../models');
const { checkAndParse } = require('../validators/dataTypes');
const { POST_PAGE_LEN } = require('../variables');

async function getCommunityPosts(req, res) {
    const name = req.params.name;
    const pageNo = req.query.pageNo;
    const filter = checkAndParse({
        mandatoryArgs: {
            strings: { name },
        },
    });
    const constraint = checkAndParse({
        mandatoryArgs: {
            numbers: { pageNo },
        },
    });
    if (!filter || !constraint || constraint.pageNo <= 0)
        return res.sendStatus(400);
    const community = (
        await Community.aggregate([
            { $match: filter },
            {
                $project: {
                    numPosts: { $size: '$addedPosts' },
                },
            },
        ])
    )[0];
    if (!community) return res.sendStatus(404);
    const offset = -constraint.pageNo * POST_PAGE_LEN;
    const gap = community.numPosts + offset;
    const effectiveLength =
        gap >= 0 ? POST_PAGE_LEN : Math.max(0, POST_PAGE_LEN + gap);
    if (!effectiveLength) return res.sendStatus(404);
    const addedPosts = (
        await Community.findOne(filter)
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
                options: { sort: '-createdAt' },
            })
            .exec()
    ).addedPosts;
    if (!addedPosts.length) return res.sendStatus(404);
    res.status(200).json(addedPosts);
}

async function createCommunity(req, res) {
    const handle = req.session.handle;
    const name = req.body.name.trim();
    const description = req.body.description.trim();
    const banner = req.body.banner;
    const input = checkAndParse({
        mandatoryArgs: {
            strings: {
                name,
                description,
            },
        },
    });
    if (!input) return res.sendStatus(400);
    const community = await Community.findOne({ name }).select('_id').exec();
    if (community) return res.sendStatus(409);
    const user = await User.findOne({ handle })
        .select('_id createdCommunities')
        .exec();
    input.admin = user._id;
    input.banner = banner;
    const newCommunity = await Community.create(input);
    user.createdCommunities.push(newCommunity._id);
    await user.save();
    res.sendStatus(204);
}

module.exports = {
    getCommunityPosts,
    createCommunity,
};
