const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
dotenv.config();
connectDB();


const followRouter = require("./routers/followRouter");
const authRouter = require("./routers/authRouters");
const userRouter = require("./routers/userRouters");
const postRouters = require("./routers/postRouters");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "twitter app is working",
    status: "success",
  });
});


app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/post", postRouters);
app.use("/follow", followRouter);


app.listen(PORT, () => {
  console.log(`Server running on port:${process.env.PORT}`);
});
