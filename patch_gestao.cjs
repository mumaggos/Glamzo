const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

const targetMethod = "  const handleDistribute = async (e: React.FormEvent) => {";

const replacementMethod = "  const handleDeleteLead = async (id: string) => {\n    if (!confirm('Tem a certeza que deseja apagar esta lead?')) return;\n    try {\n      const { error } = await supabase.from('leads').delete().eq('id', id);\n      if (error) throw error;\n      setLeads(prev => prev.filter(l => l.id !== id));\n      setUploadMessage({ type: 'success', text: 'Lead apagada com sucesso.' });\n    } catch (err: any) {\n      console.error(err);\n      setUploadMessage({ type: 'error', text: 'Erro ao apagar lead.' });\n    }\n  };\n\n  const handleDistribute = async (e: React.FormEvent) => {";

content = content.replace(targetMethod, replacementMethod);

const targetTh = '                        <th className="p-4 text-center">Fecho (%)</th>\n                        <th className="p-4">Notas</th>\n                      </tr>';

const replacementTh = '                        <th className="p-4 text-center">Fecho (%)</th>\n                        <th className="p-4">Notas</th>\n                        <th className="p-4 text-center">Ações</th>\n                      </tr>';

content = content.replace(targetTh, replacementTh);

const targetTd = "                        <td className=\"p-4 text-center font-bold text-slate-700\">{lead.estado_chamada !== 'pendente' ? lead.potencial_fecho : '-'}</td>\n                        <td className=\"p-4 text-xs text-slate-500 max-w-[200px] truncate\" title={lead.notas}>{lead.notas || '-'}</td>\n                      </tr>";

const replacementTd = "                        <td className=\"p-4 text-center font-bold text-slate-700\">{lead.estado_chamada !== 'pendente' ? lead.potencial_fecho : '-'}</td>\n                        <td className=\"p-4 text-xs text-slate-500 max-w-[200px] truncate\" title={lead.notas}>{lead.notas || '-'}</td>\n                        <td className=\"p-4 text-center\">\n                          <button onClick={() => handleDeleteLead(lead.id)} className=\"p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors\" title=\"Apagar Lead\">\n                            <Trash2 className=\"w-4 h-4\" />\n                          </button>\n                        </td>\n                      </tr>";

content = content.replace(targetTd, replacementTd);

if (!content.includes('Trash2')) {
  content = content.replace("import { Users,", "import { Users, Trash2,");
}

fs.writeFileSync('src/components/GestaoLeads.tsx', content);
