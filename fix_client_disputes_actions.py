import re

with open("src/components/ClientDisputes.tsx", "r") as f:
    text = f.read()

imports = "import { Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react';"
text = re.sub(r"import \{.*?\} from 'lucide-react';", imports, text)

# Add handleDelete and handleResolve
actions = """  const handleResolve = async (disputeId: string) => {
    if (!window.confirm("Confirmar resolução desta disputa?")) return;
    try {
      const { error } = await supabase.from('disputes').update({ status: 'resolved' }).eq('id', disputeId);
      if (error) throw error;
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' } : d));
      setExpanded(null);
    } catch (err) {
      alert("Erro ao resolver disputa");
    }
  };

  const handleDelete = async (disputeId: string) => {
    if (!window.confirm("Tem a certeza que deseja apagar o registo desta disputa?")) return;
    try {
      const { error } = await supabase.from('disputes').delete().eq('id', disputeId);
      if (error) throw error;
      setDisputes(prev => prev.filter(d => d.id !== disputeId));
    } catch (err) {
      alert("Erro ao apagar disputa");
    }
  };
"""

if "const handleResolve = async" not in text:
    text = text.replace(
        "const getStatusBadge = (status: string) => {",
        actions + "\n  const getStatusBadge = (status: string) => {"
    )

old_header = """            <div>
              {expanded === d.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>"""

new_header = """            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.status !== 'resolved' && d.status !== 'refunded' && (
                  <button onClick={(e) => { e.stopPropagation(); handleResolve(d.id); }} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Marcar como Resolvido">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Apagar Disputa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {expanded === d.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>"""

text = text.replace(old_header, new_header)

# add group class to the container
text = text.replace(
    'className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer"',
    'className="group flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer"'
)

with open("src/components/ClientDisputes.tsx", "w") as f:
    f.write(text)

