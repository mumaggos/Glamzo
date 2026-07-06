import re
with open('src/pages/partner/SetupWizard.tsx', 'r') as f:
    content = f.read()

# Add Clock import
content = content.replace("Upload} from 'lucide-react';", "Upload, Clock} from 'lucide-react';")

# Add state
state_code = """
  const DEFAULT_HOURS = [
    { weekday: 1, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 2, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 3, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 4, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 5, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 6, open_time: '09:00', close_time: '13:00', is_closed: false },
    { weekday: 0, open_time: '09:00', close_time: '19:00', is_closed: true }
  ];
  const [businessHours, setBusinessHours] = useState(DEFAULT_HOURS);
  
  const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  const handleHourChange = (weekday: number, field: string, value: any) => {
    setBusinessHours(prev => prev.map(h => h.weekday === weekday ? { ...h, [field]: value } : h));
  };
"""
content = content.replace("const [logoUrl, setLogoUrl] = useState<string | null>(null);", "const [logoUrl, setLogoUrl] = useState<string | null>(null);\n" + state_code)

# Load business hours
load_hours_code = """
          const { data: hoursData } = await supabase.from('business_hours').select('*').eq('business_id', currentBiz.id).order('weekday');
          if (hoursData && hoursData.length > 0) {
            setBusinessHours(hoursData);
          }
"""
content = content.replace("const { data: servicesData } = await supabase", load_hours_code + "\n          const { data: servicesData } = await supabase")

# Change step condition indices
content = content.replace("} else if (step === 4) {", "} else if (step === 5) {")
content = content.replace("} else if (step === 3) {", "} else if (step === 4) {")
content = content.replace("} else if (step === 2) {", "} else if (step === 3) {")

# Insert new step 2 logic
step_2_logic = """
    } else if (step === 2) {
      setLoading(true);
      setErrorMsg('');
      try {
        if (!business) throw new Error('Business not found');
        
        const hoursToSave = businessHours.map(h => ({
          ...h,
          business_id: business.id
        }));
        
        await supabase.from('business_hours').delete().eq('business_id', business.id);
        const { error: hoursErr } = await supabase.from('business_hours').insert(hoursToSave);
        if (hoursErr) throw hoursErr;
        
        const updateData = { setup_step: 3, onboarding_step: 3 };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        setBusiness({ ...business, ...updateData });
        setStep(3);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
"""
content = content.replace("} else if (step === 3) {", step_2_logic + "\n    } else if (step === 3) {")

# Fix setup_steps inside the logic blocks
content = content.replace("setup_step: 3", "setup_step: 4")  # for step 3 (old 2)
# Wait, this global replace is dangerous. Let's do it manually with re.sub

content = re.sub(r'onboarding_step: 3,\s*setup_step: 3', 'onboarding_step: 4, setup_step: 4', content)
content = re.sub(r'onboarding_step: 4,\s*setup_step: 4', 'onboarding_step: 5, setup_step: 5', content)
content = re.sub(r'onboarding_step: 5,\s*setup_step: 5', 'onboarding_step: 6, setup_step: 6', content)

# update setSteps
content = re.sub(r'setStep\(5\);', 'setStep(6);', content)
content = re.sub(r'setStep\(4\);', 'setStep(5);', content)
# Note: setStep(3) will also be matched in step_2_logic, so let's only replace the OLD ones.
# Actually I'll use regex to target the exact old ones.
content = re.sub(r'setBusiness\(\{ \.\.\.business, setup_step: 5 \}\);\s*setStep\(\s*6\s*\);', 'setBusiness({ ...business, setup_step: 6 });\n        setStep(6);', content)
content = re.sub(r'setBusiness\(\{ \.\.\.business, setup_step: 4 \}\);\s*setStep\(\s*5\s*\);', 'setBusiness({ ...business, setup_step: 5 });\n        setStep(5);', content)
content = re.sub(r'setBusiness\(\{ \.\.\.business, setup_step: 3 \}\);\s*setStep\(\s*4\s*\);', 'setBusiness({ ...business, setup_step: 4 });\n        setStep(4);', content)
# wait, the setBusiness line inside step 3 (old 2) is:
# setBusiness({ ...business, setup_step: 3 });
# setStep(3);
content = content.replace("setBusiness({ ...business, setup_step: 3 });\n        setStep(3);", "setBusiness({ ...business, setup_step: 4 });\n        setStep(4);")
content = content.replace("setBusiness({ ...business, setup_step: 4 });\n        setStep(4);", "setBusiness({ ...business, setup_step: 5 });\n        setStep(5);")
content = content.replace("setBusiness({ ...business, setup_step: 5 });\n        setStep(5);", "setBusiness({ ...business, setup_step: 6 });\n        setStep(6);")

# Update steps array
steps_array_old = """
  const steps = [
    { num: 1, title: 'Loja', icon: <Building2 className="w-4 h-4" /> },
    { num: 2, title: 'Serviços', icon: <Scissors className="w-4 h-4" /> },
    { num: 3, title: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
    { num: 4, title: 'Pagamentos', icon: <Landmark className="w-4 h-4" /> },
    { num: 5, title: 'Revisão', icon: <CheckCircle className="w-4 h-4" /> }
  ];
"""
steps_array_new = """
  const steps = [
    { num: 1, title: 'Loja', icon: <Building2 className="w-4 h-4" /> },
    { num: 2, title: 'Horários', icon: <Clock className="w-4 h-4" /> },
    { num: 3, title: 'Serviços', icon: <Scissors className="w-4 h-4" /> },
    { num: 4, title: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
    { num: 5, title: 'Pagamentos', icon: <Landmark className="w-4 h-4" /> },
    { num: 6, title: 'Revisão', icon: <CheckCircle className="w-4 h-4" /> }
  ];
"""
content = content.replace(steps_array_old.strip(), steps_array_new.strip())

# Update width calculation for progress bar
content = content.replace("((step - 1) / 4) * 100", "((step - 1) / 5) * 100")

# Update JSX step conditions
content = content.replace("{step === 5 && (", "{step === 6 && (")
content = content.replace("{step === 4 && (", "{step === 5 && (")
content = content.replace("{step === 3 && (", "{step === 4 && (")
content = content.replace("{step === 2 && (", "{step === 3 && (")
content = content.replace("{step < 5 && (", "{step < 6 && (")

step_2_jsx = """
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Horários de Funcionamento</h2>
            <p className="text-sm text-slate-500 mb-6">Defina os dias e horas em que a sua loja está aberta. Isto garante que os clientes apenas podem marcar dentro deste horário.</p>
            <div className="space-y-4">
              {WEEKDAYS.map((dayName, idx) => {
                const h = businessHours.find(bh => bh.weekday === idx);
                if (!h) return null;
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3 w-32">
                      <input 
                        type="checkbox" 
                        checked={!h.is_closed}
                        onChange={(e) => handleHourChange(idx, 'is_closed', !e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <span className="font-bold text-sm text-slate-700">{dayName}</span>
                    </div>
                    
                    {!h.is_closed ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input 
                          type="time" 
                          value={h.open_time}
                          onChange={(e) => handleHourChange(idx, 'open_time', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <span className="text-slate-400 font-bold">até</span>
                        <input 
                          type="time" 
                          value={h.close_time}
                          onChange={(e) => handleHourChange(idx, 'close_time', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-sm font-bold text-slate-400 px-3 py-2">
                        Fechado
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
"""

# Insert new JSX step 2 right after step 1 ends (we'll insert it right before the new step 3)
content = content.replace("{step === 3 && (", step_2_jsx + "\n        {step === 3 && (", 1) # Only first occurrence

with open('src/pages/partner/SetupWizard.tsx', 'w') as f:
    f.write(content)

