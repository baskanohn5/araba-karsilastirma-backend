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

    skipSuccessfulRequests: false,
    skipFailedRequests: false,

  

    message: {
      success: false,
      message,
    },

    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message,
        retryAfter:
          req.rateLimit && req.rateLimit.resetTime
            ? req.rateLimit.resetTime
            : null,
      });
    },
  });
};

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message:
    "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
});

const aiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "AI kullanım limiti aşıldı. Lütfen biraz sonra tekrar deneyin.",
});

const compareLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message:
    "Karşılaştırma limiti aşıldı. Lütfen biraz sonra tekrar deneyin.",
});

const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.",
});

const strictLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 40,
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