import * as fs from 'fs';

let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const targetHelmet = `      <Helmet>
        <title>{business.name} - Reservas Online | Glamzo</title>
      </Helmet>`;

const newHelmet = `      <Helmet>
        <title>{business.name} - Reservas Online | Glamzo</title>
        {business.logo_url && <link rel="icon" href={business.logo_url} />}
      </Helmet>`;

if (content.includes(targetHelmet)) {
  content = content.replace(targetHelmet, newHelmet);
  fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
  console.log("Added favicon to Helmet");
} else {
  console.log("Helmet target not found");
}
