const fs = require('fs');
let text = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');
text = text.replace("import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';", "import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';");
fs.writeFileSync('src/pages/BusinessDetail.tsx', text);
