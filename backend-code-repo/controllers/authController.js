const userModel = require("../model/userModel.js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { auth } = require("./config/firebaseAdmin");
const generateToken = require("../utils/authUtil.js");


const registerController = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalEmail = email.trim().toLowerCase();
    const normalUsername = username.trim();

    const userEmailExist = await userModel.findOne({
      email: normalEmail,
    });

    if (userEmailExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const userNameExist = await userModel.findOne({
      username: normalUsername,
    });

    if (userNameExist) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT) || 10
    );

    const userObj = new userModel({
      username: normalUsername,
      name: name.trim(),
      email: normalEmail,
      password: hashPassword,
    });

    const userDb = await userObj.save();

    const token = generateToken(userDb);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: userDb._id,
        username: userDb.username,
        name: userDb.name,
        email: userDb.email,
        profilePhoto: userDb.profilePhoto,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalEmail = email.trim().toLowerCase();

    // Validate email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalEmail
    );

    if (!isEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Find user
    const user = await userModel.findOne({
      email: normalEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const googleLoginController = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Check Google login provider
    if (decodedToken.firebase?.sign_in_provider !== "google.com") {
      return res.status(401).json({
        success: false,
        message: "Please sign in using Google",
      });
    }

    const email = decodedToken.email?.trim().toLowerCase();

    if (!email || !decodedToken.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Verified Google email is required",
      });
    }

    // Find existing user
    let user = await userModel.findOne({ email });

    if (!user) {
      const name = decodedToken.name || email.split("@")[0];
      const profilePhoto = decodedToken.picture || null;

      // Create unique username
      const baseUsername =
        email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 20) || "user";

      let username = baseUsername;

      while (await userModel.findOne({ username })) {
        username = `${baseUsername}_${crypto
          .randomBytes(3)
          .toString("hex")}`;
      }

      // Generate random password for Google user
      const randomPassword = crypto.randomBytes(32).toString("hex");

      const hashedPassword = await bcrypt.hash(
        randomPassword,
        Number(process.env.SALT) || 10
      );

      // Create new user
      user = await userModel.create({
        name,
        email,
        username,
        profilePhoto,
        password: hashedPassword,
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });

  } catch (error) {
    console.error("Google Login Error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};



const loggedInUserController = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await userModel
      .findById(userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Logged In User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



module.exports = {
  registerController,
  loginController,
  googleLoginController,
  loggedInUserController,
};
