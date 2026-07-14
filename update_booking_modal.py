import re

with open("src/components/BookingModal.tsx", "r") as f:
    text = f.read()

target = r"""                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Observações para o salão</label>"""

replacement = """                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-800 text-sm">Glamzo Club</h5>
                      <p className="text-xs text-amber-700 font-medium mt-1">
                        {business?.charges_enabled 
                          ? "Ganha 50 Glamzo Points ao pagar pela App ou 25 Points ao pagar no local" 
                          : "Ganha 25 Glamzo Points com esta reserva"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Observações para o salão</label>"""

text = text.replace(target, replacement)

with open("src/components/BookingModal.tsx", "w") as f:
    f.write(text)
