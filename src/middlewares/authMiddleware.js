const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Oturum bilgisi bulunamadı",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz oturum formatı",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Oturum tokenı boş",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

  req.user = {
    uid: decodedToken.uid,
    email: decodedToken.email || null,
    phoneNumber: decodedToken.phone_number || null,
    admin: decodedToken.admin || false,
    role: decodedToken.role || null,
};

    return next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", {
      code: error.code,
      message: error.message,
    });

    return res.status(401).json({
      success: false,
      message: "Oturum süresi dolmuş veya geçersiz",
    });
  }
};

module.exports = authMiddleware;