const admin = require("firebase-admin");
require("../config/firebase");

const setAdmin = async () => {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log("Kullanım: npm run set-admin kullanici@email.com");
      process.exit(1);
    }

    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });

    console.log(`${email} kullanıcısına admin yetkisi verildi.`);
    process.exit();
  } catch (error) {
    console.error("Hata:", error.message);
    process.exit(1);
  }
};

setAdmin();