const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı doğrulanmadı",
      });
    }

    const isAdmin =
      req.user.admin === true ||
      req.user.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Bu işlem için admin yetkisi gerekiyor",
      });
    }

    next();
  } catch (error) {
    console.error(
      "ADMIN MIDDLEWARE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Admin doğrulama hatası",
    });
  }
};

module.exports = adminMiddleware;const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı doğrulanmadı",
      });
    }

    const isAdmin =
      req.user.admin === true ||
      req.user.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Bu işlem için admin yetkisi gerekiyor",
      });
    }

    next();
  } catch (error) {
    console.error(
      "ADMIN MIDDLEWARE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Admin doğrulama hatası",
    });
  }
};

module.exports = adminMiddleware;