const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/HoursTab.tsx', 'utf8');

const newLogic = `
  const [localHours, setLocalHours] = useState<Record<number, { open_time: string, close_time: string, is_closed: boolean, id?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadHours = async () => {
    if (!business) return;
    try {
      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", business.id);

      if (error) throw error;
      
      const loaded: Record<number, any> = {};
      (data || []).forEach(h => {
        loaded[h.weekday] = {
          id: h.id,
          open_time: h.open_time,
          close_time: h.close_time,
          is_closed: h.is_closed
        };
      });
      setLocalHours(loaded);
    } catch (err) {
      console.error("Error loading hours", err);
    }
  };

  useEffect(() => {
    loadHours();
  }, [business]);

  const handleLocalChange = (dayIndex: number, field: string, value: any) => {
    setLocalHours(prev => {
      const current = prev[dayIndex] || { open_time: "09:00", close_time: "19:00", is_closed: false };
      return { ...prev, [dayIndex]: { ...current, [field]: value } };
    });
  };

  const handleCopyHoursToAll = (sourceWeekday: number) => {
    const sourceDay = localHours[sourceWeekday] || { open_time: "09:00", close_time: "19:00", is_closed: false };
    setLocalHours(prev => {
      const next = { ...prev };
      for (let i = 0; i < 7; i++) {
        if (i !== sourceWeekday) {
          next[i] = {
            ...next[i],
            open_time: sourceDay.open_time,
            close_time: sourceDay.close_time,
            is_closed: sourceDay.is_closed
          };
        }
      }
      return next;
    });
    setGlobalSuccess("Horário copiado para todos os dias. Não se esqueça de guardar!");
    setTimeout(() => setGlobalSuccess(null), 3000);
  };

  const saveAllHours = async () => {
    if (!business) return;
    setIsSaving(true);
    setGlobalError(null);
    setGlobalSuccess(null);

    try {
      const promises = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
        const h = localHours[dayIndex] || { open_time: "09:00", close_time: "19:00", is_closed: false };
        if (h.id) {
          return supabase.from("business_hours").update({
            open_time: h.open_time,
            close_time: h.close_time,
            is_closed: h.is_closed
          }).eq("id", h.id);
        } else {
          return supabase.from("business_hours").insert({
            business_id: business.id,
            weekday: dayIndex,
            open_time: h.open_time,
            close_time: h.close_time,
            is_closed: h.is_closed
          });
        }
      });
      await Promise.all(promises);
      setGlobalSuccess("Horários de funcionamento guardados com sucesso!");
      await loadHours();
    } catch (err) {
      console.error("Error saving hours:", err);
      setGlobalError("Erro ao guardar horários.");
    } finally {
      setIsSaving(false);
    }
  };

  const timeList = Array.from({ length: 34 }, (_, i) => {
    const h = Math.floor(6 + i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    return \`\${String(h).padStart(2, "0")}:\${m}\`;
  });
`;

code = code.replace(/const loadHours = async \(\) => \{[\s\S]*?return \`\$\{String\(h\)\.padStart\(2, "0"\)\}:\$\{m\}\`;\n  \}\);/g, newLogic);
code = code.replace(/const currentDay = hours.find\(\(h\) => h.weekday === day.id\);/g, "const currentDay = localHours[day.id];");
code = code.replace(/const isClosed = currentDay \? currentDay.is_closed : false;/g, "const isClosed = currentDay ? currentDay.is_closed : false;");
code = code.replace(/const openTime = currentDay \? currentDay.open_time.substring\(0, 5\) : "09:00";/g, "const openTime = currentDay?.open_time ? currentDay.open_time.substring(0, 5) : \"09:00\";");
code = code.replace(/const closeTime = currentDay \? currentDay.close_time.substring\(0, 5\) : "19:00";/g, "const closeTime = currentDay?.close_time ? currentDay.close_time.substring(0, 5) : \"19:00\";");

code = code.replace(/handleUpdateHours\(day\.id, "open_time", e\.target\.value\)/g, 'handleLocalChange(day.id, "open_time", e.target.value)');
code = code.replace(/handleUpdateHours\(day\.id, "close_time", e\.target\.value\)/g, 'handleLocalChange(day.id, "close_time", e.target.value)');
code = code.replace(/handleUpdateHours\(day\.id, "is_closed", e\.target\.checked\)/g, 'handleLocalChange(day.id, "is_closed", e.target.checked)');

code = code.replace(/<\/div>\n      <\/div>\n    <\/div>\n  \);/g, `</div>
      </div>
      
      <div className="flex justify-end pt-4 pb-10">
        <button
          onClick={saveAllHours}
          disabled={isSaving}
          className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2"
        >
          {isSaving ? <span className="animate-pulse">A Guardar...</span> : <CheckCircle2 className="w-5 h-5" />}
          {!isSaving && "Guardar Alterações"}
        </button>
      </div>
    </div>
  );`);

fs.writeFileSync('src/pages/partner/tabs/HoursTab.tsx', code);
