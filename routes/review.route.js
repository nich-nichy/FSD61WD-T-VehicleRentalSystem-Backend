const {
    CreateReview,
    GetAllReviews
} = require("../controllers/review.controller");
const router = require("express").Router();

router.post('/create-review', CreateReview)

router.post("get-reviews", GetAllReviews)

module.exports = router;