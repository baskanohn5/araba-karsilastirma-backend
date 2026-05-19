const db = require("../config/firebase");

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("chatHistory")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const history = [];

    snapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      total: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Chat geçmişi alınamadı",
      error: error.message
    });
  }
};

module.exports = {
  getChatHistory
};