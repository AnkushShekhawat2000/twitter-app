const express = require("express");

const authRouter = express.Router();

const {
  registerController,
  loginController,
  googleLoginController,
  loggedInUserController,
} = require("../controllers/authController");



authRouter.post("/register", registerController)
          .post("/login", loginController)
          .post("/google-login", googleLoginController)
          .get("/loggedInUser", loggedInUserController);



module.exports = authRouter;