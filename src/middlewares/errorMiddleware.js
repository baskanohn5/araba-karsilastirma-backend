const errorMiddleware = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  const statusCode = err.status || 500;

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Sunucu hatası",
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: "Sunucu hatası oluştu",
  });
};

module.exports = errorMiddleware;