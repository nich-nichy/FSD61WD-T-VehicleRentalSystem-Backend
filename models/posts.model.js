const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
    posts: Array,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Posts", postsSchema);