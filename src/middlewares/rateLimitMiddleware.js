const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = apiLimiter;