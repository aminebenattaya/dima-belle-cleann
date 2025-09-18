import admin from 'firebase-admin';
import fs from 'fs';

// Charge la clé privée depuis le fichier JSON (modifie le chemin si besoin)
const serviceAccount = JSON.parse(fs.readFileSync('/home/user/studio/firebase-admin.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Le rôle admin a été attribué à l'utilisateur ${uid}`);
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l’attribution du rôle admin:', error);
    process.exit(1);
  }
}

const uid = process.argv[2];

if (!uid) {
  console.error('Usage : node setAdminClaim.mjs <UID>');
  process.exit(1);
}

setAdminClaim(uid);
