const express = require("express");

const authRouter = express.Router();

const {
  registerController,
  loginController,
  googleLoginController,
  loggedInUserController,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/isAuthMiddleware");



authRouter.post("/register", registerController)
          .post("/login", loginController)
          .post("/google-login", googleLoginController)
          .get("/loggedInUser", authMiddleware, loggedInUserController);



module.exports = authRouter;