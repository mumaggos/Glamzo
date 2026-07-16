const fs = require('fs');
let content = fs.readFileSync('src/components/StoreManagementTab.tsx', 'utf8');

const oldUpdate = `  const handleUpdateStore = async (id: string, updates: Partial<Business>) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      toast.success('Loja atualizada com sucesso!');
      onUpdate();
    } catch (err: any) {
      toast.error('Erro ao atualizar: ' + err.message);
    }
  };`;

const newUpdate = `  const handleUpdateStore = async (id: string, updates: Partial<Business>) => {
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
      toast.error('Erro ao atualizar: ' + err.message);
    }
  };`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('src/components/StoreManagementTab.tsx', content);
console.log("StoreManagementTab updated");
