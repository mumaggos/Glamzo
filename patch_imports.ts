import fs from 'fs';

let home = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
let biz = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

if (!home.includes('import { useAuth }')) {
  home = home.replace(
    'import { useNavigate, Link, useSearchParams } from "react-router-dom";',
    'import { useNavigate, Link, useSearchParams } from "react-router-dom";\nimport { useAuth } from "../hooks/useAuth";\nimport { toggleFavorite, fetchCustomerFavorites } from "../utils/marketingHelper";'
  );
}

if (!biz.includes('import { optimizeSupabaseUrl }')) {
  biz = biz.replace(
    'import { Business, Service, Review, WorkingHours, StoreAsset } from "../types";',
    'import { Business, Service, Review, WorkingHours, StoreAsset } from "../types";\nimport { optimizeSupabaseUrl } from "../utils/imageOptimizer";'
  );
}

fs.writeFileSync('src/pages/Home.tsx', home);
fs.writeFileSync('src/pages/BusinessDetail.tsx', biz);
