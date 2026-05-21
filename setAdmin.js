const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];

if (!uid) {
  console.log("Kullanım: node setAdmin.js USER_UID");
  process.exit(1);
}

admin
  .auth()
  .setCustomUserClaims(uid, {
    admin: true,
    role: "admin",
  })
  .then(() => {
    console.log("Admin yetkisi verildi:", uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Admin yetkisi verilemedi:", error);
    process.exit(1);
  });