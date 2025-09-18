
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Helper function to clean individual config values
const cleanConfigValue = (value: string | undefined): string => {
  if (!value) return '';
  let cleanedValue = value.trim(); // e.g., "\"KEY\"," OR "KEY," OR "\"KEY\""

  // First, remove a trailing comma if it exists at the very end
  if (cleanedValue.endsWith(',')) {
    cleanedValue = cleanedValue.substring(0, cleanedValue.length - 1);
  }
  cleanedValue = cleanedValue.trim(); // Trim again, e.g., now it's "\"KEY\"" or "KEY"

  // Then, remove surrounding double quotes if they exist
  if (cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) {
    cleanedValue = cleanedValue.substring(1, cleanedValue.length - 1);
  }
  return cleanedValue.trim(); // Final trim, e.g., "KEY"
};

const firebaseConfig = {
  apiKey: cleanConfigValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanConfigValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanConfigValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanConfigValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanConfigValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanConfigValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// Map internal config keys to actual environment variable names for error reporting
const envVarNames: { [key in keyof typeof firebaseConfig]?: string } = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
};

const essentialConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];
const missingEssentialKeys = essentialConfigKeys.filter(key => {
  const value = firebaseConfig[key];
  return !value || value.trim() === '';
});

if (missingEssentialKeys.length > 0) {
  const humanReadableMissingKeys = missingEssentialKeys
    .map(key => envVarNames[key] || `UNKNOWN_KEY_FOR_${key}`)
    .join(', ');

  const errorMessage = `ERREUR CRITIQUE DE CONFIGURATION FIREBASE: 
Certaines variables d'environnement Firebase essentielles sont manquantes ou vides.
Clés manquantes ou vides: ${humanReadableMissingKeys}.
Veuillez vérifier que votre fichier .env existe à la racine du projet et contient TOUTES les variables NEXT_PUBLIC_FIREBASE_* nécessaires avec des valeurs valides.
L'erreur "auth/invalid-api-key" est probablement due à cela.
Consultez les paramètres de votre projet sur la console Firebase pour obtenir les bonnes valeurs.`;
  console.error(errorMessage);
}

// Initialiser Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
