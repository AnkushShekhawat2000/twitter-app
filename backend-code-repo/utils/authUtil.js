const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  if (!user?._id) {
    throw new Error("Valid user is required");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

module.exports = generateToken;