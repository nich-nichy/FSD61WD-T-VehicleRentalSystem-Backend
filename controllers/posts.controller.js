const Posts = require('../models/posts.model');

module.exports.GetPosts = async (req, res) => {
    try {
        const getAll = await Posts.find({});
        const posts = getAll.flatMap(post => post.posts);
        res.status(200).json({
            message: "Posts fetched successfully",
            data: posts,
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
