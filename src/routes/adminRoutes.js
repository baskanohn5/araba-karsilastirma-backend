const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "Admin erişimi başarılı",
    user: req.user,
  });
});

module.exports = router;