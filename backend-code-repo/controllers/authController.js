const userModel = require("../model/userModel.js");


const registerController = async (req, res) => {
  const { username, name, email, password } = req.body;



  try {
    const userEmailExist = await userModel.findOne({ email });

    if (userEmailExist) {
      return res.status(400).json({
        message: "Email already exist",
      });
    }

    const userNameExist = await userModel.findOne({ username });

    if (userNameExist) {
      return res.status(400).json({
        message: "Username already exist",
      });
    }

    const userObj = new userModel({
      username,
      name,
      email,
      password,
    });

    const userDb = await userObj.save();

    return res.status(201).json({
      message: "User created successfully",
      user: userDb,
    });

  } catch (error) {

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });

  }
};



const loginController = async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user,
    });

  } catch (err) {

    return res.status(500).json({
      message: "Server error",
    });

  }
};





const googleLoginController = async (req, res) => {

  const { name, email, profilePhoto } = req.body;

  try {

    let user = await userModel.findOne({ email });

    if (user) {

      return res.status(200).json({
        message: "Login success",
        user,
      });

    }

    const newUser = new userModel({
      name,
      email,
      username: email.split("@")[0],
      profilePhoto,
      password: "GOOGLE_AUTH_USER",
    });

    const savedUser = await newUser.save();

    return res.status(201).json({
      message: "User created",
      user: savedUser,
    });

  } catch (err) {

    return res.status(500).json({
      message: "Server error",
    });

  }
};





const loggedInUserController = async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);

  } catch (error) {

    return res.status(500).json({
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