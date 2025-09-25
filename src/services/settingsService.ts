// src/services/settingsService.ts
'use server';

// Utilise le SDK Admin pour les opérations côté serveur, garantissant les bonnes permissions.
import { adminDb } from '@/lib/firebase-admin';
import type { SiteSettings } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';

const SITE_SETTINGS_COLLECTION = 'siteConfiguration';
const GENERAL_SETTINGS_DOC_ID = 'general';

/**
 * Fetches the site settings using the Admin SDK.
 * This is safe to call from Server Components.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const settingsDocRef = adminDb.collection(SITE_SETTINGS_COLLECTION).doc(GENERAL_SETTINGS_DOC_ID);
    const settingsSnap = await settingsDocRef.get();

    if (settingsSnap.exists) {
      return { id: settingsSnap.id, ...settingsSnap.data() } as SiteSettings;
    } else {
      console.warn("Le document des paramètres du site n'a pas été trouvé. Il sera créé lors du premier enregistrement.");
      // Return a default structure to avoid errors in the UI
      return {
        id: GENERAL_SETTINGS_DOC_ID,
        siteName: 'Dima Belle',
        contactEmail: 'contact@example.com',
        phoneNumber: '',
        address: '',
        socialMediaLinks: {
          instagram: '',
          facebook: '',
        }
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres du site: ", error);
    // This could indicate a permissions issue if rules are misconfigured.
    // Return null to prevent the page from crashing. The UI will handle the null case.
    return null;
  }
}
