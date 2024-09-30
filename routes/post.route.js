const {
    GetPosts,
} = require("../controllers/posts.controller");
const router = require("express").Router();

router.get('/get-posts', GetPosts)

module.exports = router;