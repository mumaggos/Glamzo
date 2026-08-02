const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

code = code.replace(
`<Image src={cat.image} priority={index < 2} alt="" fill className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />`,
`<Image src={cat.image} priority={index < 2} alt="" fill sizes="(max-width: 640px) 160px, 160px" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />`
);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
