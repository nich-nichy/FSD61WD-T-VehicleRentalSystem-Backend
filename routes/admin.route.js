const { checkAdmin, getDashboardData } = require("../controllers/admin.controller");
const router = require("express").Router();

router.post("/admin-auth", checkAdmin)

router.get("/admin-dashboard", getDashboardData)

module.exports = router;