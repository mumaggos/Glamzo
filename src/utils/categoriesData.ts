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
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'Nails & Beauty',
    name: 'Nails & Beauty',
    emoji: '💅',
    description: 'Serviços especializados de manicure, pedicure, gel, design de sobrancelhas, pestanas e maquilhagem.',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'Estética',
    name: 'Estética',
    emoji: '✨',
    description: 'Cuidados faciais e corporais especializados, depilação tradicional e a laser, skin care e bronzeamento.',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'Wellness',
    name: 'Wellness',
    emoji: '💆',
    description: 'Terapias relaxantes de massagens, tratamentos de spa regenerativos, osteopatia, reiki e bem-estar.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'Ao domicílio',
    name: 'Ao domicílio',
    emoji: '🏠',
    description: 'Comodidade extrema de atendimento personalizado com especialistas que se deslocam a sua residência.',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'Noivas & Eventos',
    name: 'Noivas & Eventos',
    emoji: '👰',
    description: 'Serviços completos e rituais de beleza personalizados para casamentos, convidados e eventos formais.',
    imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=600'
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
