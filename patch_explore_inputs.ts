import fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');

content = content.replace(
  '<input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="Ex: Manicure, Barbearia..."',
  '<input type="text" aria-label="Pesquisar serviço ou salão" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="Ex: Manicure, Barbearia..."'
);

content = content.replace(
  '<input type="text" value={localSearchLocation} onChange={(e) => { setLocalSearchLocation(e.target.value); setUseNearMe(false); setUserCoords(null); }} placeholder="Cidade, Concelho, Morada..."',
  '<input type="text" aria-label="Localização" value={localSearchLocation} onChange={(e) => { setLocalSearchLocation(e.target.value); setUseNearMe(false); setUserCoords(null); }} placeholder="Cidade, Concelho, Morada..."'
);

content = content.replace(
  '<input type="checkbox" checked={filterHomeService} onChange={(e) => setFilterHomeService(e.target.checked)}',
  '<input type="checkbox" aria-label="Filtro Ao Domicílio" checked={filterHomeService} onChange={(e) => setFilterHomeService(e.target.checked)}'
);

content = content.replace(
  '<input type="checkbox" checked={filterPremiumPartner} onChange={(e) => setFilterPremiumPartner(e.target.checked)}',
  '<input type="checkbox" aria-label="Filtro Parceiro Premium" checked={filterPremiumPartner} onChange={(e) => setFilterPremiumPartner(e.target.checked)}'
);

content = content.replace(
  '<input type="checkbox" checked={filterAvailableToday} onChange={(e) => setFilterAvailableToday(e.target.checked)}',
  '<input type="checkbox" aria-label="Filtro Aberto Hoje" checked={filterAvailableToday} onChange={(e) => setFilterAvailableToday(e.target.checked)}'
);

content = content.replace(
  '<input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="O que procura?"',
  '<input type="text" aria-label="O que procura?" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="O que procura?"'
);

content = content.replace(
  '<input type="text" value={localSearchLocation} onChange={(e) => setLocalSearchLocation(e.target.value)} placeholder="Ex: Pedroso, Gaia, Funchal..."',
  '<input type="text" aria-label="Localização (Filtros)" value={localSearchLocation} onChange={(e) => setLocalSearchLocation(e.target.value)} placeholder="Ex: Pedroso, Gaia, Funchal..."'
);

fs.writeFileSync('src/pages/Explore.tsx', content);
