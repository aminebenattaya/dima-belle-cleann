// scripts/setAdminClaim.mjs
// IMPORTANT: Ce script s'exécute avec Node.js, pas dans le navigateur.
// Il nécessite le SDK Admin de Firebase.

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import readline from 'readline';

// --- Configuration ---
// Le chemin vers votre fichier de clé de service Firebase.
// Assurez-vous que cette variable d'environnement est définie avant d'exécuter le script.
// Exemple: GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account.json" node scripts/setAdminClaim.mjs
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(`
ERREUR : La variable d'environnement GOOGLE_APPLICATION_CREDENTIALS n'est pas définie.
Cette variable doit pointer vers le chemin de votre fichier de clé de compte de service Firebase.
Vous pouvez la générer ici : Console Firebase > Paramètres du projet > Comptes de service > Générer une nouvelle clé privée.

Exemple d'exécution :
GOOGLE_APPLICATION_CREDENTIALS="/chemin/vers/votre/cle.json" node scripts/setAdminClaim.mjs
    `);
    process.exit(1);
}

// Initialise l'application Firebase Admin
try {
    initializeApp({
        credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    });
    console.log("Firebase Admin SDK initialisé avec succès.");
} catch (error) {
    console.error("Erreur lors de l'initialisation du Firebase Admin SDK :", error.message);
    console.error("Veuillez vérifier que le chemin dans GOOGLE_APPLICATION_CREDENTIALS est correct.");
    process.exit(1);
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setAdminClaim() {
  try {
    const uid = await askQuestion("Veuillez entrer l'UID de l'utilisateur à promouvoir administrateur : ");

    if (!uid || uid.trim().length < 5) {
        console.error("UID invalide. Opération annulée.");
        return;
    }

    console.log(`\nTentative de définition du claim { admin: true } pour l'UID : ${uid}`);
    
    // Définir le custom claim { admin: true } pour l'utilisateur
    await getAuth().setCustomUserClaims(uid.trim(), { admin: true });

    console.log(`\x1b[32m%s\x1b[0m`, `\nSUCCÈS : Le Custom Claim { admin: true } a été défini pour l'utilisateur ${uid}.`);
    console.log("\nIMPORTANT : L'utilisateur doit se déconnecter et se reconnecter pour que le changement prenne effet.");

  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "\nERREUR lors de la définition du Custom Claim :");
    if (error.code === 'auth/user-not-found') {
        console.error("L'UID fourni ne correspond à aucun utilisateur existant. Veuillez vérifier l'UID dans la console Firebase (Authentication > Users).");
    } else {
        console.error(error.message);
    }
  } finally {
    rl.close();
  }
}

setAdminClaim();
