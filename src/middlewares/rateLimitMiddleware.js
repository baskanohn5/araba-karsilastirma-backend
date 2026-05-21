const rateLimit = require("express-rate-limit");

const createLimiter = ({
  windowMs,
  max,
  message,
}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message:
    "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
});

const aiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message:
    "AI kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.",
});

const compareLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message:
    "Karşılaştırma limiti aşıldı. Lütfen biraz sonra tekrar deneyin.",
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    "Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.",
});

const strictLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message:
    "Bu işlem için saatlik limit aşıldı. Lütfen daha sonra tekrar deneyin.",
});

module.exports = {
  apiLimiter,
  aiLimiter,
  compareLimiter,
  authLimiter,
  strictLimiter,
};