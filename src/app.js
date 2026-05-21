const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./docs/swagger");

const {
  apiLimiter,
  aiLimiter,
  compareLimiter,
} = require("./middlewares/rateLimitMiddleware");

const carRoutes = require("./routes/carRoutes");
const compareRoutes = require("./routes/compareRoutes");
const aiRoutes = require("./routes/aiRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const chatHistoryRoutes = require("./routes/chatHistoryRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      if (origin.startsWith("http://127.0.0.1")) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AutoCompare API çalışıyor",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(apiLimiter);

app.use("/api/cars", carRoutes);
app.use("/api/compare", compareLimiter, compareRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/chat-history", chatHistoryRoutes);
app.use("/api/chat", aiLimiter, chatRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

module.exports = app;