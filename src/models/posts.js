const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        belongsTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community',
            required: true,
        },
        file: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        numLikes: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
