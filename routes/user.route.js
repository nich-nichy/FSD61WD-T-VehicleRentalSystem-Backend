const { userVerification } = require("../middlewares/user.middleware")
const {
    SignupFunction,
    LoginFunction,
    PasswordResetFunction,
    UpdatePasswordFunction,
    checkUserFunction
} = require("../controllers/user.controller");
const router = require("express").Router();

router.post('/', userVerification)

router.post("/check-user", checkUserFunction)

router.post("/signup", SignupFunction);

router.post('/login', LoginFunction)

router.post("/reset-request", PasswordResetFunction)

router.post("/reset-password/:token", UpdatePasswordFunction)


module.exports = router;