const fs = require('fs');
let content = fs.readFileSync('src/components/StoreManagementTab.tsx', 'utf8');

// 1. Add handleDownloadQR
const newFunctions = `
  const handleDownloadQR = async (salon: Business) => {
    const storeUrl = \`https://glamzo.pt/\${salon.slug}?source=qr\`;
    const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=\${encodeURIComponent(storeUrl)}\`;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = \`QR_\${salon.name.replace(/\\s+/g, '_')}.png\`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(qrUrl, '_blank');
    }
  };

  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const handleDeleteStore = async (id: string) => {
    if (storeToDelete !== id) {
      setStoreToDelete(id);
      return;
    }
    
    try {
      const { error } = await supabase.from('businesses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Loja apagada com sucesso.');
      onUpdate();
    } catch (err: any) {
      toast.error('Erro ao apagar loja: ' + err.message);
    }
    setStoreToDelete(null);
  };
`;

content = content.replace("const handleImpersonate", newFunctions + "\n  const handleImpersonate");

// 2. Add imports
content = content.replace("import { CheckCircle2, Monitor, MapPin, Key, UserCog, Search } from 'lucide-react';", "import { CheckCircle2, Monitor, MapPin, Key, UserCog, Search, QrCode, Trash2, Calendar } from 'lucide-react';");

// 3. Add table headers
content = content.replace(
  '<th className="py-4.5 px-4 text-center">Kit<br/>Boas-Vindas</th>',
  '<th className="py-4.5 px-4 text-center">Subscrição</th>\n                    <th className="py-4.5 px-4 text-center">Kit<br/>Boas-Vindas</th>'
);

// 4. Add Subscription Status column before Kit Boas-Vindas
const subHtml = `
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={\`inline-block px-2 py-0.5 border rounded-full text-[9px] font-mono font-bold uppercase tracking-tight \${
                        salon.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        salon.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        salon.subscription_status === 'past_due' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }\`}>
                        {salon.subscription_status === 'active' ? 'Ativa' :
                         salon.subscription_status === 'trialing' ? 'Trial' :
                         salon.subscription_status === 'past_due' ? 'Atrasada' : 'Inativa'}
                      </span>
                      {salon.subscription_status === 'active' && (
                         <span className="text-[9px] text-slate-500 flex items-center gap-0.5" title="Próximo Pagamento">
                            <Calendar className="w-2.5 h-2.5" /> Automático
                         </span>
                      )}
                    </div>
                  </td>
`;
content = content.replace(
  '                  <td className="py-4 px-4 text-center">\n                    <button\n                      onClick={() => handleUpdateStore(salon.id, { welcome_kit_sent: !salon.welcome_kit_sent })}',
  subHtml + '\n                  <td className="py-4 px-4 text-center">\n                    <button\n                      onClick={() => handleUpdateStore(salon.id, { welcome_kit_sent: !salon.welcome_kit_sent })}'
);

// 5. Add QR Code and Delete button next to Impersonate
const actionsHtml = `
                      <button 
                        onClick={() => handleDownloadQR(salon)}
                        className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center justify-center"
                        title="Download QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteStore(salon.id)}
                        className={\`w-8 h-8 rounded-full transition-colors flex items-center justify-center \${storeToDelete === salon.id ? 'bg-rose-600 text-white animate-pulse' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}\`}
                        title={storeToDelete === salon.id ? "Clique novamente para confirmar" : "Apagar Loja"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
`;
content = content.replace(
  '<button \n                        onClick={() => handleImpersonate(salon.email)}',
  actionsHtml + '\n                      <button \n                        onClick={() => handleImpersonate(salon.email)}'
);

fs.writeFileSync('src/components/StoreManagementTab.tsx', content);
console.log("StoreManagementTab rewritten for QR, Subscription, Delete");
