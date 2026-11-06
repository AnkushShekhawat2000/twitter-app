
const accessSchema = require("../schemas/accessSchema");

const POST_INTERVAL_MS = 2000;

const rateLimiting = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const now = new Date();

    const access = await accessSchema.findOne({
      sessionId: userId,
    });

    if (!access) {
      await accessSchema.create({
        sessionId: userId,
        lastRequestTime: now,
      });

      return next();
    }

    const elapsedMs =
      now.getTime() - new Date(access.lastRequestTime).getTime();

    if (elapsedMs < POST_INTERVAL_MS) {
      const retryAfterSeconds = Math.ceil(
        (POST_INTERVAL_MS - elapsedMs) / 1000
      );

      res.set("Retry-After", String(retryAfterSeconds));

      return res.status(429).json({
        success: false,
        message: "Please wait before posting again",
        retryAfterSeconds,
      });
    }

    await accessSchema.updateOne(
      { _id: access._id },
      {
        $set: {
          lastRequestTime: now,
        },
      }
    );

    return next();

  } catch (error) {
    console.error("Rate Limiting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = rateLimiting;
