const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({
        success: false,
        message: "Oturum bilgisi bulunamadı",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Geçersiz oturum formatı",
      });
    }

    const token = parts[1].trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Oturum tokenı boş",
      });
    }

    const decodedToken = await admin
      .auth()
      .verifyIdToken(token, true);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      phoneNumber: decodedToken.phone_number || null,
      admin: decodedToken.admin === true,
      role: decodedToken.role || null,
    };

    return next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", {
      code: error.code,
      message: error.message,
      path: req.originalUrl,
      method: req.method,
      time: new Date().toISOString(),
    });

    return res.status(401).json({
      success: false,
      message: "Oturum süresi dolmuş veya geçersiz",
    });
  }
};

module.exports = authMiddleware;