const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/ServicesTab.tsx', 'utf8');

const importReplacement = `import { SUBCATEGORIES_BY_MAIN } from "../../../utils/categoriesData";\nimport { Scissors, Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";`;
content = content.replace('import { Scissors, Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";', importReplacement);

const stateReplacement = `  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: 35,
    duration_minutes: 45,
    category_id: "",
    image_url: "",
    is_active: true,
  });
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);`;
content = content.replace(`  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: 35,
    duration_minutes: 45,
    category_id: "",
    image_url: "",
    is_active: true,
  });`, stateReplacement);

const saveReplacement = `  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    try {
      let finalCategoryId = serviceForm.category_id || null;

      // Handle custom or predefined categories not yet in DB
      if (finalCategoryId && !finalCategoryId.includes('-')) { 
        // Simple check if it is not a UUID. Or if isAddingCustomCategory
        const newCatName = isAddingCustomCategory ? customCategoryName : finalCategoryId;
        if (newCatName) {
           const { data: newCat, error: catError } = await supabase.from('service_categories').insert({
             business_id: business.id,
             name: newCatName,
             order_index: categories.length
           }).select().single();
           
           if (!catError && newCat) {
             finalCategoryId = newCat.id;
           } else {
             finalCategoryId = null;
           }
        }
      }

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update({
            name: serviceForm.name,
            description: serviceForm.description,
            price: Number(serviceForm.price),
            duration_minutes: Number(serviceForm.duration_minutes),
            category_id: finalCategoryId,
            image_url: serviceForm.image_url || null,
            is_active: serviceForm.is_active,
          })
          .eq("id", editingService.id);
        if (error) throw error;
        setGlobalSuccess("Serviço editado com sucesso.");
      } else {
        const { error } = await supabase.from("services").insert({
          business_id: business.id,
          name: serviceForm.name,
          description: serviceForm.description,
          price: Number(serviceForm.price),
          duration_minutes: Number(serviceForm.duration_minutes),
          category_id: finalCategoryId,
          image_url: serviceForm.image_url || null,
          is_active: serviceForm.is_active,
        });
        if (error) throw error;
        setGlobalSuccess("Novo serviço adicionado com sucesso.");
      }

      setShowServiceModal(false);
      setEditingService(null);
      setIsAddingCustomCategory(false);
      setCustomCategoryName("");
      await loadLayoutData();
    } catch (err: any) {
      setGlobalError(err.message || "Erro ao guardar serviço.");
    }
  };`;

content = content.replace(/  const handleSaveService = async \(e: React.FormEvent\) => \{[\s\S]*?    \} catch \(err: any\) \{\n      setGlobalError\(err\.message \|\| "Erro ao guardar serviço\."\);\n    \}\n  \};/, saveReplacement);

const selectReplacement = `              <div className="space-y-1.5">
                <label className="text-slate-500">Categoria (Opcional)</label>
                {!isAddingCustomCategory ? (
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none"
                    value={serviceForm.category_id}
                    onChange={(e) => {
                      if (e.target.value === "ADD_NEW") {
                         setIsAddingCustomCategory(true);
                         setServiceForm({ ...serviceForm, category_id: "" });
                      } else {
                         setServiceForm({ ...serviceForm, category_id: e.target.value })
                      }
                    }}
                  >
                    <option value="">Sem Categoria Associada</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                    {business?.business_type && SUBCATEGORIES_BY_MAIN[business.business_type]?.map((preDef) => {
                      if (!categories.find(c => c.name === preDef)) {
                        return <option key={preDef} value={preDef}>{preDef} (Sugerida)</option>;
                      }
                      return null;
                    })}
                    <option value="ADD_NEW">+ Outra (Adicionar nova)</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                      placeholder="Nome da Categoria"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCustomCategory(false);
                        setCustomCategoryName("");
                      }}
                      className="bg-slate-100 text-slate-500 px-4 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>`;

content = content.replace(/              <div className="space-y-1\.5">\n                <label className="text-slate-500">Categoria \(Opcional\)<\/label>\n                <select\n                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none"\n                  value=\{serviceForm\.category_id\}\n                  onChange=\{\(e\) =>\n                    setServiceForm\(\{\n                      \.\.\.serviceForm,\n                      category_id: e\.target\.value,\n                    \}\)\n                  \}\n                >\n                  <option value="">Sem Categoria Associada<\/option>\n                  \{categories\.map\(\(cat\) => \(\n                    <option key=\{cat\.id\} value=\{cat\.id\}>\n                      \{cat\.name\}\n                    <\/option>\n                  \)\)\}\n                <\/select>\n              <\/div>/g, selectReplacement);

fs.writeFileSync('src/pages/partner/tabs/ServicesTab.tsx', content);
