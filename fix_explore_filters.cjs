const fs = require('fs');

let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

// There are some <option>s in Explore.tsx that need translation. We need to make sure ALL of them use t()
explore = explore.replace(/<option value="">Todos<\/option>/g, "<option value=\"\">{t('radius_all') || 'Raio: Todos'}</option>");
explore = explore.replace(/<option value="5">Até 5 km<\/option>/g, "<option value=\"5\">{t('up_to') || 'Até'} 5 km</option>");
explore = explore.replace(/<option value="10">Até 10 km<\/option>/g, "<option value=\"10\">{t('up_to') || 'Até'} 10 km</option>");
explore = explore.replace(/<option value="25">Até 25 km<\/option>/g, "<option value=\"25\">{t('up_to') || 'Até'} 25 km</option>");
explore = explore.replace(/<option value="50">Até 50 km<\/option>/g, "<option value=\"50\">{t('up_to') || 'Até'} 50 km</option>");
explore = explore.replace(/<option value="recomendados">Recomendados<\/option>/g, "<option value=\"recomendados\">{t('recommended') || 'Recomendados'}</option>");
explore = explore.replace(/<option value="distancia">Distância: Mais Próximo<\/option>/g, "<option value=\"distancia\">{t('distance_closest') || 'Distância: Mais Próximo'}</option>");
explore = explore.replace(/<option value="preco_asc">Preço: Mais barato primeiro<\/option>/g, "<option value=\"preco_asc\">{t('price_cheapest') || 'Preço: Mais barato primeiro'}</option>");
explore = explore.replace(/<option value="rating">Melhor Avaliação<\/option>/g, "<option value=\"rating\">{t('best_rating') || 'Melhor Avaliação'}</option>");

// "Perto de Mim"
explore = explore.replace(/"Perto de Mim"/g, "t('near_you') || \"Perto de Mim\"");
explore = explore.replace(/'Perto de Mim'/g, "t('near_you') || 'Perto de Mim'");

// Update Home.tsx "Perto de Mim"
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(/"Perto de Mim"/g, "t('near_you') || \"Perto de Mim\"");
home = home.replace(/'Perto de Mim'/g, "t('near_you') || 'Perto de Mim'");
// Pesquisar por {searchLocation}
home = home.replace(/Pesquisar por "\{searchLocation\}"/g, "{t('search') || 'Pesquisar'} por \\\"{searchLocation}\\\"");

fs.writeFileSync('src/pages/Explore.tsx', explore);
fs.writeFileSync('src/pages/Home.tsx', home);

