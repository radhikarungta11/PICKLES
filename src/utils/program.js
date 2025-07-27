function comparePosts(post1, post2) {
    return post2.createdAt - post1.createdAt;
}

module.exports = { comparePosts };
