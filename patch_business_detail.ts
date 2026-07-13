import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const replacement = `<button 
                    onClick={() => window.dispatchEvent(new Event('open-glamzo-chat'))}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition mb-3"
                  >
                    <div className={\`w-2.5 h-2.5 rounded-full \${isStoreOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}\`}></div>
                    Falar com a Loja no Chat
                  </button>
                  <a`;

if (content.includes('Falar no WhatsApp') && !content.includes('Falar com a Loja no Chat')) {
  // We need to inject isStoreOnline state
  if (!content.includes('const [isStoreOnline')) {
    content = content.replace(
      /const \[business, setBusiness\] = useState<any \| null>\(null\);/,
      "const [business, setBusiness] = useState<any | null>(null);\n  const [isStoreOnline, setIsStoreOnline] = useState(false);"
    );
    
    const fetchLogicTarget = `        const { data } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
        if (data) {`;
        
    const fetchLogicReplacement = `        const { data } = await supabase.from('businesses').select('*, profiles!businesses_owner_id_fkey(last_active)').eq('slug', slug).maybeSingle();
        if (data) {
          if (data.profiles && (data.profiles as any).last_active) {
            const last = new Date((data.profiles as any).last_active).getTime();
            const now = new Date().getTime();
            setIsStoreOnline(now - last < 5 * 60 * 1000);
          }`;
          
    content = content.replace(fetchLogicTarget, fetchLogicReplacement);
  }

  content = content.replace(
    /(<a \s*href=\{business\.whatsapp \|\| `https:\/\/wa\.me\/)/,
    replacement.replace('<a', '$1')
  );
  
  fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
  console.log("Patched BusinessDetail.tsx successfully");
} else {
  console.log("Could not find WhatsApp button or already patched");
}
