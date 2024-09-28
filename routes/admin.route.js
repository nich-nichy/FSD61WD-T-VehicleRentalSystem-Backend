const { checkAdmin } = require("../controllers/admin.controller");
const router = require("express").Router();

router.post("/admin-auth", checkAdmin)

module.exports = router;