import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const perfFix = `        const now = new Date();
        
        // Performance optimization: Create maps for O(1) lookups instead of nested filters
        const reviewsMap = new Map();
        revDataFinal.forEach((r: any) => {
          if (!reviewsMap.has(r.business_id)) reviewsMap.set(r.business_id, []);
          reviewsMap.get(r.business_id).push(r);
        });

        const servicesMap = new Map();
        srvData.forEach((s: any) => {
          if (!servicesMap.has(s.business_id)) servicesMap.set(s.business_id, []);
          servicesMap.get(s.business_id).push(s);
        });
            
        const processed = loadedBiz.map(b => {
          const bReviews = reviewsMap.get(b.id) || [];
          const rating = bReviews.length > 0 ? bReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / bReviews.length : 0;
              
          const bServices = servicesMap.get(b.id) || [];
          let realStartPrice = 0;
          let hasRealPromotion = b.is_promoted || false;

          if (bServices.length > 0) {
            let minPrice = Infinity;
            for (let i = 0; i < bServices.length; i++) {
               const s = bServices[i];
               const hasDiscount = (s.discount_price != null && s.discount_price > 0 && s.discount_price < s.price) || (s.price_promotion != null && s.price_promotion > 0);
               if (hasDiscount) hasRealPromotion = true;
               const p = s.discount_price || s.price_promotion || s.price;
               if (p != null && !isNaN(p) && p < minPrice) minPrice = p;
            }
            if (minPrice !== Infinity) realStartPrice = minPrice;
          }

          const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;`;

content = content.replace(
  /const now = new Date\(\);\s*const processed = loadedBiz\.map\(b => \{[\s\S]*?const lat = b\.latitude \?\? getCoordinatesForCity\(b\.district, b\.city\)\.latitude;/m,
  perfFix
);

fs.writeFileSync('src/pages/Home.tsx', content);
