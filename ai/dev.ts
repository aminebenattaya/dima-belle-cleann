
import { config } from 'dotenv';
config();

// Les importations de flux et d'outils sont commentées pour permettre la compilation statique (next export).
// Ces dépendances contiennent du code côté serveur qui ne peut pas être inclus dans un build client.
import '@/ai/flows/style-recommendation.ts';
import '@/ai/tools/find-products-tool.ts';
