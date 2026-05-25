const errorMiddleware = (err, req, res, next) => {
  const statusCode =
    err.statusCode ||
    err.status ||
    500;

  const isProduction =
    process.env.NODE_ENV === "production";

  console.error("GLOBAL ERROR:", {
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    time: new Date().toISOString(),
  });

  if (!isProduction) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Sunucu hatası",
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Sunucu hatası oluştu"
        : err.message || "İstek işlenemedi",
  });
};

module.exports = errorMiddleware;