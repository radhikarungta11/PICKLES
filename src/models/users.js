const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        handle: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        numFollowing: {
            type: Number,
            required: true,
            default: 0,
        },
        followedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post',
            },
        ],
        savedPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post',
            },
        ],
        createdCommunities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Community',
            },
        ],
        followedCommunities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Community',
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
