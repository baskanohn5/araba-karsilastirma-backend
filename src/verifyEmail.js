const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];

if (!uid) {
  console.log("Kullanım: node verifyEmail.js USER_UID");
  process.exit(1);
}

admin
  .auth()
  .updateUser(uid, {
    emailVerified: true,
  })
  .then(() => {
    console.log("E-posta doğrulandı:", uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error("E-posta doğrulanamadı:", error);
    process.exit(1);
  });