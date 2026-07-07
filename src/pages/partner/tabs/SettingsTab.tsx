import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Settings, Image as ImageIcon, Building2, Clock, Check, Upload, Save, ShieldAlert, KeyRound, Zap, CreditCard } from "lucide-react";
import { Business } from "../../../types";
import { supabase } from "../../../lib/supabase";

interface PartnerContextType {
  business: Business | null;
}

export default function SettingsTab() {
  const { business } = useOutletContext<PartnerContextType>();
  const [activeTab, setActiveTab] = useState("dados");

  const [savingDados, setSavingDados] = useState(false);
  const [savingSeguranca, setSavingSeguranca] = useState(false);
  const [savingImagens, setSavingImagens] = useState(false);
  const [savingRegras, setSavingRegras] = useState(false);

  const [globalMessage, setGlobalMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Estados dos Formulários
  const [formData, setFormData] = useState({
    name: business?.name || "",
    address: business?.address || "",
    door_number: business?.door_number || "",
    postal_code: business?.postal_code || "",
    city: business?.city || "",
    phone: business?.phone || "",
    email: business?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    newPassword: "",
    repeatNewPassword: ""
  });

  // Estado para guardar os Ficheiros Reais para upload
  const [selectedFiles, setSelectedFiles] = useState<{logo: File | null, cover: File | null}>({ logo: null, cover: null });
  const [images, setImages] = useState({
    logo_url: business?.logo_url || "",
    cover_url: business?.cover_url || ""
  });

  const [rules, setRules] = useState({
    min_notice: business?.min_booking_notice?.toString() || "60",
    cancellation_policy: business?.cancellation_policy || "flexible"
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!business) return null;

  const showMessage = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  const handleSaveDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDados(true);
    try {
      const { error } = await supabase.from('businesses').update(formData).eq('id', business.id);
      if (error) throw error;
      showMessage('success', 'Dados da loja atualizados com sucesso.');
    } catch (err) {
      showMessage('error', 'Erro ao atualizar dados da loja.');
    } finally {
      setSavingDados(false);
    }
  };

  const handleSaveSeguranca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeguranca(true);
    if (passwordData.newPassword !== passwordData.repeatNewPassword) {
      showMessage('error', 'As novas passwords não coincidem.');
      setSavingSeguranca(false); return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'A password deve ter pelo menos 6 caracteres.');
      setSavingSeguranca(false); return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      showMessage('success', 'Password alterada com sucesso.');
      setPasswordData({ current: "", newPassword: "", repeatNewPassword: "" });
    } catch (err) {
      showMessage('error', 'Erro ao alterar a password.');
    } finally {
      setSavingSeguranca(false);
    }
  };

  const handleImageChange = (type: 'logo' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Guarda o ficheiro real na memória para o upload futuro
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
      // Cria um link provisório para o preview no ecrã
      const url = URL.createObjectURL(file);
      setImages(prev => ({ ...prev, [`${type}_url`]: url }));
    }
  };

  const handleSaveImagens = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingImagens(true);
    try {
      let finalLogoUrl = images.logo_url;
      let finalCoverUrl = images.cover_url;

      // 1. Upload do Logo (se foi alterado)
      if (selectedFiles.logo) {
        const fileExt = selectedFiles.logo.name.split('.').pop();
        const fileName = `logo_${business.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('business-images') // BUCKET CORRIGIDO
          .upload(fileName, selectedFiles.logo, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        // Pega no URL público permanente
        const { data } = supabase.storage.from('business-images').getPublicUrl(fileName);
        finalLogoUrl = data.publicUrl;
      }

      // 2. Upload da Capa (se foi alterada)
      if (selectedFiles.cover) {
        const fileExt = selectedFiles.cover.name.split('.').pop();
        const fileName = `cover_${business.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('business-images') // BUCKET COR
