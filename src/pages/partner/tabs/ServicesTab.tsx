import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { SUBCATEGORIES_BY_MAIN } from "../../../utils/categoriesData";
import { Scissors, Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Business, Service, ServiceCategory } from "../../../types";
import { useFormatPrice } from "../../../utils/formatPrice";

interface PartnerContextType {
  business: Business | null;
  categories: ServiceCategory[];
  services: Service[];
  loadLayoutData: () => Promise<void>;
  isLoadingData: boolean;
}

export default function ServicesTab() {
  const { t } = useTranslation();
  const { business, categories, services, loadLayoutData, isLoadingData } = useOutletContext<PartnerContextType>();
  const formatPrice = useFormatPrice();

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: 35,
    duration_minutes: 45,
    category_id: "",
    image_url: "",
    is_active: true,
  });
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const handleSaveService = async (e: React.FormEvent) => {
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
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Pretende realmente eliminar este serviço da plataforma?")) return;
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      setGlobalSuccess("Serviço eliminado do registo real.");
      await loadLayoutData();
    } catch (err: any) {
      setGlobalError(
        "Falha ao eliminar serviço. Certifique-se de que não existem marcações associadas a este serviço."
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto animate-fade-in text-slate-700">
      {globalSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalSuccess}
        </div>
      )}
      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
            Catálogo de Serviços
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuração dos seus procedimentos estéticos com preços e durações reais.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setServiceForm({
              name: "",
              description: "",
              price: 35,
              duration_minutes: 45,
              category_id: categories.length > 0 ? categories[0].id : "",
              image_url: "",
              is_active: true,
            });
            setShowServiceModal(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Serviço</span>
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl">
        {isLoadingData ? (
          <div className="grid gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 text-slate-200">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-16 rounded-xl" />
                  <div className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <Skeleton className="w-8 h-8 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Scissors className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-bold">
              Sem serviços configurados.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Adicione os cortes, colorações ou tratamentos disponíveis no seu salão.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl gap-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-1">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 border border-purple-100 text-purple-600 font-black">
                    {svc.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">
                      {svc.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {svc.duration_minutes} min • {formatPrice(Number(svc.price), business?.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-10 sm:ml-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                  <button
                    onClick={() => {
                      setEditingService(svc);
                      setServiceForm({
                        name: svc.name,
                        description: svc.description || "",
                        price: Number(svc.price),
                        duration_minutes: svc.duration_minutes,
                        category_id: svc.category_id || "",
                        image_url: svc.image_url || "",
                        is_active: svc.is_active,
                      });
                      setShowServiceModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Editar Serviço"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-2 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Remover Serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showServiceModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h4 className="font-extrabold text-base text-slate-900">
                {editingService
                  ? "Editar Serviço Profissional"
                  : "Adicionar Novo Serviço Real"}
              </h4>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveService}
              className="space-y-4 text-xs font-semibold"
            >
              <div className="space-y-1.5">
                <label className="text-slate-500">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte Masculino Premium"
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500">Preço (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 font-mono"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        price: e.target.value as any,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500">Duração (min)</label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none font-mono"
                    value={serviceForm.duration_minutes}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        duration_minutes: Number(e.target.value),
                      })
                    }
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hora</option>
                    <option value={75}>1h 15m</option>
                    <option value={90}>1h 30m</option>
                    <option value={105}>1h 45m</option>
                    <option value={120}>2 horas</option>
                    <option value={150}>2h 30m</option>
                    <option value={180}>3 horas</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
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
                    {business?.category && SUBCATEGORIES_BY_MAIN[business.category]?.map((preDef) => {
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
                    >{t('cancel') || 'Cancelar'}</button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold p-3.5 rounded-xl transition shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{editingService ? "Guardar Alterações" : "Criar Serviço"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
