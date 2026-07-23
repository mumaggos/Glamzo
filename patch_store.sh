sed -i "s/'pt' | 'en'/'pt' | 'en' | 'es' | 'fr' | 'de'/g" /app/applet/src/store/useGlobalStore.ts
sed -i "s/(lang: 'pt' | 'en')/(lang: 'pt' | 'en' | 'es' | 'fr' | 'de')/g" /app/applet/src/store/useGlobalStore.ts
