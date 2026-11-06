const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
dotenv.config();
connectDB();

const followRouter = require("./routers/followRouter");
const authRouter = require("./routers/authRouters");
const userRouter = require("./routers/userRouters");
const postRouters = require("./routers/postRouters");
const discoveryRouter = require("./routers/discoveryRouter");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH"] },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    const payload = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    socket.userId = payload.id;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  socket.join(socket.userId.toString());
});

app.set("io", io);

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
app.use("/discover", discoveryRouter);


server.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`);
});
