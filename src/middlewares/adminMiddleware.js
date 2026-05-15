const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı doğrulanmadı"
      });
    }

    if (req.user.admin !== true) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için admin yetkisi gerekiyor"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = adminMiddleware;