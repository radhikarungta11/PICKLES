const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        banner: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        numUsers: {
            type: Number,
            required: true,
            default: 1,
        },
        addedPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post',
            },
        ],
    },
    { timestamps: true }
);

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
