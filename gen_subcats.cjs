const categories = {
  'Cabelo & Barbearia': ['Barbearia', 'Cabeleireiro Feminino', 'Cabeleireiro Masculino', 'Coloração', 'Tratamentos Capilares', 'Corte Infantil'],
  'Nails & Beauty': ['Manicure', 'Pedicure', 'Gel', 'Acrílico', 'Nail Art', 'Pestanas', 'Sobrancelhas', 'Maquilhagem'],
  'Estética': ['Depilação', 'Depilação Laser', 'Facial', 'Corporal', 'Skin Care', 'Bronzeamento'],
  'Wellness': ['Massagem Relaxante', 'Terapêutica', 'Spa', 'Osteopatia', 'Reiki', 'Reflexologia'],
  'Ao domicílio': ['Barbeiro ao domicílio', 'Nails ao domicílio', 'Makeup ao domicílio', 'Massagem ao domicílio'],
  'Noivas & Eventos': ['Noivas', 'Madrinhas', 'Beauty Day', 'Maquilhagem Evento', 'Penteados Evento', 'Packs Casamento']
};

const barber = ['Corte', 'Corte + Barba', 'Barba', 'Contornos', 'Tratamento Capilar', 'Coloração'];

let all = new Set();
for (let key in categories) {
  categories[key].forEach(v => all.add(v));
}
barber.forEach(v => all.add(v));

const items = Array.from(all);
console.log(JSON.stringify(items));
