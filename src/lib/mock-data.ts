import type { Product, BlogPost, GalleryItem, FilterOptions } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Foulard en Soie Élégance Orientale',
    category: 'Foulard',
    price: 45.99,
    colors: [
        { name: 'Beige', stock: 10, images: [{view: 'face', url: ''}] },
        { name: 'Rose Poudré', stock: 5, images: [{view: 'face', url: ''}] },
        { name: 'Doré', stock: 3, images: [{view: 'face', url: ''}] }
    ],
    sizes: ['Taille Unique'],
    imageUrl: 'https://placehold.co/600x800.png',
    dataAiHint: 'silk scarf',
    description: 'Un foulard en soie luxueux aux motifs inspirés de l\'art oriental, parfait pour une touche d\'élégance.',
    details: ['100% Soie Naturelle', 'Dimensions: 90x90cm', 'Lavage à la main recommandé']
  },
  {
    id: '2',
    name: 'Turban Chic Nuit Étoilée',
    category: 'Turban',
    price: 29.50,
    colors: [
        { name: 'Noir', stock: 15, images: [{view: 'face', url: ''}] },
        { name: 'Argenté', stock: 8, images: [{view: 'face', url: ''}] }
    ],
    sizes: ['Taille Unique'],
    imageUrl: 'https://placehold.co/600x800.png',
    dataAiHint: 'black turban',
    description: 'Turban pré-noué scintillant, idéal pour les soirées ou pour ajouter une touche glamour à votre tenue.',
    details: ['Coton et Lurex', 'Facile à enfiler', 'Confortable']
  },
  {
    id: '3',
    name: 'Abaya Moderne Crépuscule Rosé',
    category: 'Prêt-à-porter',
    price: 120.00,
    colors: [
        { name: 'Rose Poudré', stock: 7, images: [{view: 'face', url: ''}] },
        { name: 'Gris Perle', stock: 4, images: [{view: 'face', url: ''}] }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrl: 'https://placehold.co/600x800.png',
    dataAiHint: 'pink abaya',
    description: 'Abaya fluide et moderne, avec des détails subtils pour un look contemporain et modeste.',
    details: ['Tissu crêpe de haute qualité', 'Coupe ample', 'Manches longues évasées']
  },
  {
    id: '4',
    name: 'Foulard en Coton Bio Douceur Matinale',
    category: 'Foulard',
    price: 25.00,
    colors: [
        { name: 'Blanc Cassé', stock: 20, images: [{view: 'face', url: ''}] },
        { name: 'Bleu Ciel', stock: 12, images: [{view: 'face', url: ''}] }
    ],
    sizes: ['Taille Unique'],
    imageUrl: 'https://placehold.co/600x800.png',
    dataAiHint: 'cotton scarf',
    description: 'Foulard en coton biologique, doux et respirant, parfait pour un usage quotidien.',
    details: ['100% Coton Biologique GOTS', 'Dimensions: 180x70cm', 'Teintures naturelles']
  },
  {
    id: '5',
    name: 'Turban Velours Royal Bordeaux',
    category: 'Turban',
    price: 35.00,
    colors: [
        { name: 'Bordeaux', stock: 9, images: [{view: 'face', url: ''}] },
        { name: 'Doré', stock: 6, images: [{view: 'face', url: ''}] }
    ],
    sizes: ['Taille Unique'],
    imageUrl: 'https://placehold.co/600x800.png',
    dataAiHint: 'velvet turban',
    description: 'Turban en velours somptueux, orné de détails dorés, pour une allure royale.',
    details: ['Velours de coton', 'Doublure satinée', 'Finitions main']
  },
  {
    id: '6',
    name: 'Robe Longue Florale Saharienne',
    category: 'Prêt-à-porter',
    price: 89.90,
    colors: [
        { name: 'Beige', stock: 11, images: [{view: 'face', url: ''}] },
        { name: 'Vert Olive', stock: 8, images: [{view: 'face', url: ''}] },
        { name: 'Terracotta', stock: 5, images: [{view: 'face', url: ''}] }
    ],
    sizes: ['S', 'M', 'L'],
    imageUrl: 'https://placehold.co/600x800.png',
    dataAiHint: 'floral dress',
    description: 'Robe longue à imprimé floral discret, inspirée des teintes chaudes du désert.',
    details: ['Viscose écologique', 'Ceinture amovible', 'Boutonnage frontal']
  }
];

export const mockBlogPosts: BlogPost[] = [
  {
    slug: '5-facons-de-nouer-votre-foulard-en-soie',
    title: '5 Façons Élégantes de Nouer Votre Foulard en Soie',
    date: '2024-07-15',
    author: 'Amina B.',
    excerpt: 'Découvrez des techniques simples et chics pour varier les styles avec votre foulard en soie préféré...',
    content: '<p>Le foulard en soie est un accessoire intemporel qui peut transformer une tenue. Voici 5 façons de le nouer pour un look toujours renouvelé :</p><ol><li><strong>Le Classique Autour du Cou :</strong> Simple, élégant, parfait pour tous les jours.</li><li><strong>En Bandeau Rétro :</strong> Pour une touche vintage et féminine.</li><li><strong>Noué sur le Sac à Main :</strong> Accessoirisez votre sac avec une note de couleur.</li><li><strong>En Ceinture Subtile :</strong> Soulignez votre taille avec finesse.</li><li><strong>Version Turban Rapide :</strong> Pour les jours où vous souhaitez un style plus affirmé.</li></ol><p>Chaque méthode apporte une touche unique à votre style. Expérimentez et trouvez vos préférées !</p>',
    imageUrl: 'https://placehold.co/800x500.png',
    dataAiHint: 'scarf tying'
  },
  {
    slug: 'comment-choisir-son-turban-pour-chaque-occasion',
    title: 'Comment Choisir Son Turban Pour Chaque Occasion',
    date: '2024-07-01',
    author: 'Leila K.',
    excerpt: 'Du quotidien aux événements spéciaux, le turban est un allié style. Nos conseils pour faire le bon choix...',
    content: '<p>Le turban n\'est pas seulement un accessoire pratique, c\'est une véritable déclaration de style. Mais comment choisir le bon modèle ?</p><ul><li><strong>Pour le Quotidien :</strong> Optez pour des matières confortables comme le coton ou le jersey, dans des couleurs neutres ou des imprimés discrets.</li><li><strong>Pour le Travail :</strong> Des turbans unis dans des teintes sobres (noir, marine, beige) ou avec des détails élégants comme un petit nœud structuré.</li><li><strong>Pour une Soirée :</strong> Osez les matières nobles comme le velours, la soie, ou les turbans avec des sequins, des perles ou des broderies.</li><li><strong>Pour l\'Été :</strong> Privilégiez les matières légères et respirantes comme le lin ou le coton fin, et les couleurs claires ou vives.</li></ul><p>L\'important est de vous sentir à l\'aise et en accord avec votre personnalité !</p>',
    imageUrl: 'https://placehold.co/800x500.png',
    dataAiHint: 'choosing turban'
  },
  {
    slug: 'tendances-mode-modeste-automne-hiver',
    title: 'Tendances Mode Modeste Automne/Hiver 2024',
    date: '2024-06-20',
    author: 'Dima Belle Équipe',
    excerpt: 'Explorez les couleurs, matières et coupes phares de la saison pour un style modeste et tendance...',
    content: '<p>L\'automne-hiver 2024 s\'annonce riche en inspirations pour la mode modeste. Voici les tendances à ne pas manquer :</p><ul><li><strong>Couleurs :</strong> Les tons terre (terracotta, ocre, kaki) restent des valeurs sûres, accompagnés de teintes profondes comme le bordeaux, le vert forêt et le bleu nuit. Une touche de doré ou de bronze pour illuminer.</li><li><strong>Matières :</strong> Le velours côtelé, la maille douce, le tweed léger et le cuir vegan seront omniprésents. La soie reste un incontournable pour les pièces élégantes.</li><li><strong>Coupes :</strong> Les superpositions sont à l\'honneur. Pensez aux longues chemises sous des pulls amples, aux robes portées sur des pantalons fins. Les manches ballons et les cols montants apportent une touche sophistiquée.</li></ul><p>N\'oubliez pas d\'accessoiriser avec des foulards et turbans Dima Belle pour parfaire vos looks de saison !</p>',
    imageUrl: 'https://placehold.co/800x500.png',
    dataAiHint: 'modest fashion'
  }
];

export const mockGalleryItems: GalleryItem[] = [
  {
    id: 'g1',
    imageUrl: 'https://placehold.co/500x600.png',
    dataAiHint: 'woman hijab',
    customerName: 'Fatima Z.',
    testimonial: 'J\'adore ce foulard !'
  },
  {
    id: 'g2',
    imageUrl: 'https://placehold.co/500x600.png',
    dataAiHint: 'woman turban',
    customerName: 'Sarah L.',
    testimonial: 'Super qualité'
  },
  {
    id: 'g3',
    imageUrl: 'https://placehold.co/500x600.png',
    dataAiHint: 'woman abaya',
    customerName: 'Nour H.',
    testimonial: 'Très élégant'
  },
  {
    id: 'g4',
    imageUrl: 'https://placehold.co/500x600.png',
    dataAiHint: 'woman fashion',
    customerName: 'Aicha K.'
  },
   {
    id: 'g5',
    imageUrl: 'https://placehold.co/500x600.png',
    dataAiHint: 'modest style',
    customerName: 'Yasmine D.',
    testimonial: 'Parfait pour tous les jours'
  },
  {
    id: 'g6',
    imageUrl: 'https://placehold.co/500x600.png',
    dataAiHint: 'elegant hijab',
    customerName: 'Ines M.'
  }
];

// This is no longer the primary source for filter options on the products page,
// but can be kept for reference or other parts of the app.
export const filterOptionsData: FilterOptions = {
  categories: ['Tout', 'Foulard', 'Turban', 'Prêt-à-porter'],
  colors: ['Tout'], // Colors are now fetched dynamically
  sizes: ['Tout', 'S', 'M', 'L', 'XL', 'Taille Unique'],
  priceRange: [0, 200] // min, max
};
