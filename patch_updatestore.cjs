const fs = require('fs');
let code = fs.readFileSync('src/components/StoreManagementTab.tsx', 'utf8');

const newUpdate = `
  const handleUpdateStore = async (id: string, updates: Partial<Business>) => {
    try {
      const res = await fetch('/api/admin/update-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: id, updates })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update store');
      toast.success('Loja atualizada com sucesso!');
      onUpdate();
    } catch (err: any) {
      console.error("Erro no handleUpdateStore:", err);
      toast.error('Erro ao atualizar: ' + (err.message || JSON.stringify(err)));
    }
  };
`;

code = code.replace(/const handleUpdateStore = async \([\s\S]*?\} catch \(err: any\) \{[\s\S]*?\}\n  \};/, newUpdate.trim());

fs.writeFileSync('src/components/StoreManagementTab.tsx', code);
