const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get(
  "/test",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    return res.json({
      success: true,
      message: "Admin erişimi başarılı",
      user: {
        uid: req.user.uid,
        admin: req.user.admin,
        role: req.user.role,
      },
    });
  }
);

module.exports = router;