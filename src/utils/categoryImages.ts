export function getFallbackImageForCategory(category?: string | null): string {
  if (!category) return 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400';

  const normalized = category.toLowerCase().trim();

  if (normalized.includes('barbearia')) {
    return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=400'; // Barber shop
  }
  
  if (normalized.includes('spa') || normalized.includes('massagem')) {
    return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=400'; // Spa/Massage
  }
  
  if (normalized.includes('unhas') || normalized.includes('manicure') || normalized.includes('pedicure')) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'; // Nails
  }
  
  if (normalized.includes('estética') || normalized.includes('estetica') || normalized.includes('depilação')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=400'; // Estética
  }

  if (normalized.includes('tatuagem') || normalized.includes('tattoo')) {
    return 'https://images.unsplash.com/photo-1598371839696-5e5bb00b0f4b?auto=format&fit=crop&q=80&w=400'; // Tattoo
  }

  // Default / Cabeleireiro / Outros
  return 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400';
}
