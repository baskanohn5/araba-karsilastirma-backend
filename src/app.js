const express = require("express");
const cors = require("cors");

const carRoutes = require("./routes/carRoutes");
const compareRoutes = require("./routes/compareRoutes");
const aiRoutes = require("./routes/aiRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const chatHistoryRoutes = require("./routes/chatHistoryRoutes");

const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Araba Karşılaştırma API çalışıyor"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use("/api/cars", carRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/chat-history", chatHistoryRoutes);

app.use(errorMiddleware);

module.exports = app;