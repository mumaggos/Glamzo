export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  imageUrl: string;
}

export const MAIN_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'Cabelo & Barbearia',
    name: 'Cabelo & Barbearia',
    emoji: '💇',
    description: 'Cortes de cabelo modernos, barbearia clássica e especializada, colorações e tratamentos profissionais.',
    imageUrl: '/assets/categories/cabelo.webp'
  },
  {
    id: 'Nails & Beauty',
    name: 'Nails & Beauty',
    emoji: '💅',
    description: 'Serviços especializados de manicure, pedicure, gel, design de sobrancelhas, pestanas e maquilhagem.',
    imageUrl: '/assets/categories/nails.webp'
  },
  {
    id: 'Estética',
    name: 'Estética',
    emoji: '✨',
    description: 'Cuidados faciais e corporais especializados, depilação tradicional e a laser, skin care e bronzeamento.',
    imageUrl: '/assets/categories/estetica.webp'
  },
  {
    id: 'Wellness',
    name: 'Wellness',
    emoji: '💆',
    description: 'Terapias relaxantes de massagens, tratamentos de spa regenerativos, osteopatia, reiki e bem-estar.',
    imageUrl: '/assets/categories/wellness.webp'
  },
  {
    id: 'Ao domicílio',
    name: 'Ao domicílio',
    emoji: '🏠',
    description: 'Comodidade extrema de atendimento personalizado com especialistas que se deslocam a sua residência.',
    imageUrl: '/assets/categories/home.webp'
  },
  {
    id: 'Noivas & Eventos',
    name: 'Noivas & Eventos',
    emoji: '👰',
    description: 'Serviços completos e rituais de beleza personalizados para casamentos, convidados e eventos formais.',
    imageUrl: '/assets/categories/noivas.webp'
  }
];

export const SUBCATEGORIES_BY_MAIN: Record<string, string[]> = {
  'Cabelo & Barbearia': [
    'Barbearia',
    'Cabeleireiro Feminino',
    'Cabeleireiro Masculino',
    'Coloração',
    'Tratamentos Capilares',
    'Corte Infantil'
  ],
  'Nails & Beauty': [
    'Manicure',
    'Pedicure',
    'Gel',
    'Acrílico',
    'Nail Art',
    'Pestanas',
    'Sobrancelhas',
    'Maquilhagem'
  ],
  'Estética': [
    'Depilação',
    'Depilação Laser',
    'Facial',
    'Corporal',
    'Skin Care',
    'Bronzeamento'
  ],
  'Wellness': [
    'Massagem Relaxante',
    'Terapêutica',
    'Spa',
    'Osteopatia',
    'Reiki',
    'Reflexologia'
  ],
  'Ao domicílio': [
    'Barbeiro ao domicílio',
    'Nails ao domicílio',
    'Makeup ao domicílio',
    'Massagem ao domicílio'
  ],
  'Noivas & Eventos': [
    'Noivas',
    'Madrinhas',
    'Beauty Day',
    'Maquilhagem Evento',
    'Penteados Evento',
    'Packs Casamento'
  ]
};

export const BARBER_SERVICES = [
  'Corte',
  'Corte + Barba',
  'Barba',
  'Contornos',
  'Tratamento Capilar',
  'Coloração'
];
