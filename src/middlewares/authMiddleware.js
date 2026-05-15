const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token bulunamadı"
      });
    }

    const token = authHeader.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;

    next();

  } catch (error) {

    res.status(401).json({
      success: false,
      message: "Geçersiz token"
    });

  }
};

module.exports = authMiddleware;