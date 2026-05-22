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

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:15453",
  "http://localhost:32586",

  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5001",
  "http://127.0.0.1:15453",
  "http://127.0.0.1:32586",
];

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

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "AutoCompare API çalışıyor",
  });
});

app.get("/health", (req, res) => {
  return res.json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp:
      new Date().toISOString(),
  });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(apiLimiter);

app.use("/api/cars", carRoutes);

app.use(
  "/api/compare",
  compareLimiter,
  compareRoutes
);

app.use(
  "/api/ai",
  aiLimiter,
  aiRoutes
);

app.use(
  "/api/favorites",
  favoriteRoutes
);

app.use(
  "/api/chat-history",
  chatHistoryRoutes
);

app.use(
  "/api/chat",
  aiLimiter,
  chatRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(errorMiddleware);

module.exports = app;