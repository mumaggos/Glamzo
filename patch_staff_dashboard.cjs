const fs = require('fs');
let code = fs.readFileSync('src/pages/staff/StaffDashboard.tsx', 'utf8');

code = code.replace(
  /const \[settingsSuccess, setSettingsSuccess\] = useState\(""\);\n\s*const \[settingsError, setSettingsError\] = useState\(""\);/,
  `const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);`
);

code = code.replace(
  /import \{ LogOut, Calendar, Clock, User, Scissors, Settings \} from "lucide-react";/,
  `import { LogOut, Calendar, Clock, User, Scissors, Settings, Camera } from "lucide-react";
import { optimizeImageBeforeUpload } from "../../utils/imageOptimizer";`
);

code = code.replace(
  /const handleSaveSettings = async \(e: React.FormEvent\) => \{/,
  `const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !staff) return;
    
    setUploadingAvatar(true);
    try {
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = \`staff_avatars/\${staff.id}-\${Date.now()}.webp\`;
      
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, optimized.blob, {
          cacheControl: "public, max-age=31536000",
          contentType: "image/webp",
        });
        
      if (uploadErr) throw uploadErr;
      
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      const { error: updateErr } = await supabase
        .from('staff')
        .update({ avatar_url: data.publicUrl })
        .eq('id', staff.id);
        
      if (updateErr) throw updateErr;
      
      const updatedStaff = { ...staff, avatar_url: data.publicUrl };
      localStorage.setItem('staff_session', JSON.stringify(updatedStaff));
      setStaff(updatedStaff);
      setSettingsSuccess("Foto de perfil atualizada!");
    } catch (err: any) {
      setSettingsError(err.message || "Erro ao fazer upload da foto.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {`
);

code = code.replace(
  /<form onSubmit=\{handleSaveSettings\} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">/,
  `<form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <div className="flex flex-col items-center justify-center py-4 border-b border-slate-100 mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden relative group">
                  {staff.avatar_url ? (
                     <img src={staff.avatar_url} alt={staff.full_name} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-gradient-to-br from-purple-500 to-rose-500 text-white flex items-center justify-center font-bold text-3xl">
                       {staff.full_name.charAt(0)}
                     </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="animate-spin text-purple-600"><Scissors className="w-5 h-5"/></div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Tocar para alterar foto</p>
                {/* Mobile tap helper */}
                <label className="sm:hidden mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  Alterar Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              </div>`
);

fs.writeFileSync('src/pages/staff/StaffDashboard.tsx', code);
