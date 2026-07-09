const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');

// Extract the row into a new memoized component
const rowComponent = `
const ClientRow = React.memo(({ client }: { client: any }) => {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="py-4 px-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-mono font-bold text-[10px]">
          {client.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-extrabold text-slate-900">
            {client.name}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {client.email}
          </div>
        </div>
      </td>
      <td className="py-4 px-6 font-bold text-slate-700">{client.visits}</td>
      <td className="py-4 px-6 font-bold text-slate-700">{client.spent.toFixed(2)}€</td>
      <td className="py-4 px-6">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono text-[10px] font-bold">
          {client.lastVisit}
        </span>
      </td>
      <td className="py-4 px-6 text-right">
         <button className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">Ver Perfil</button>
      </td>
    </tr>
  );
});
`;

text = text.replace(/<tr key=\{client\.id\}[\s\S]*?<\/tr>/, '<ClientRow client={client} />');
if(!text.includes('ClientRow = React.memo')) {
   text = text.replace('export default function ClientsTab() {', rowComponent + '\nexport default React.memo(function ClientsTab() {');
   text = text.replace(/export default React.memo\(function ClientsTab\(\) \{[\s\S]*$/, match => match + '\n});');
   text = text.replace('export default React.memo(function ClientsTab() {', 'const ClientsTab = React.memo(function ClientsTab() {');
   text = text + '\nexport default ClientsTab;';
}

fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', text);
