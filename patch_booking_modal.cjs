const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

// 1. Strict Hours Fix
const oldHoursLogic = `    const startMin = timeToMinutes(dayHours.open_time || '09:00');
    // CORREÇÃO: O fallback passou de 18:00 para 21:00 para evitar que o calendário feche cedo demais
    const endMin = timeToMinutes(dayHours.close_time || '21:00');`;

const newHoursLogic = `    if (!dayHours.open_time || !dayHours.close_time) return [];
    const startMin = timeToMinutes(dayHours.open_time);
    const endMin = timeToMinutes(dayHours.close_time);`;

code = code.replace(oldHoursLogic, newHoursLogic);

// 2. Add Promo States
const promoStates = `
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [verifyingPromo, setVerifyingPromo] = useState(false);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setVerifyingPromo(true);
    setPromoError(null);
    try {
      const { data, error } = await supabase
        .from('business_coupons')
        .select('*')
        .eq('business_id', business.id)
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        setPromoError('Cupão inválido ou expirado.');
        setCouponDiscount(0);
        setCouponApplied(null);
        return;
      }
      
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        setPromoError('Este cupão já expirou.');
        setCouponDiscount(0);
        setCouponApplied(null);
        return;
      }

      let discount = 0;
      if (data.discount_percent) {
        discount = totalServicesPrice * (data.discount_percent / 100);
      } else if (data.discount_value) {
        discount = data.discount_value;
      }

      setCouponDiscount(discount);
      setCouponApplied(data);
      setPromoError(null);
    } catch (err) {
      setPromoError('Erro ao validar cupão.');
    } finally {
      setVerifyingPromo(false);
    }
  };
`;
// inject before `const getMonthName`
code = code.replace(/const getMonthName = \(/, promoStates + "\n  const getMonthName = (");

// 3. Inject Promo Input in Step 6
const step6Search = `<h4 className="font-black text-slate-900 text-lg">{business.name}</h4>`;
const step6Replace = step6Search; // not changing this

const totalPaySearch = `<span className="text-2xl font-black text-purple-600">{totalServicesPrice.toFixed(2)}€</span>`;
const totalPayReplace = `<span className="text-2xl font-black text-purple-600">{(Math.max(0, totalServicesPrice - couponDiscount)).toFixed(2)}€</span>
                      {couponDiscount > 0 && <span className="block text-[10px] text-emerald-500 font-bold uppercase mt-1">Desconto aplicado: -{couponDiscount.toFixed(2)}€</span>}`;

code = code.replace(totalPaySearch, totalPayReplace);

const notesSearch = `<div className="space-y-2 pt-2">`;
const promoInputHTML = `
                  <div className="space-y-2 pt-2 pb-2 border-b border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase">Código Promocional</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Insira o código" 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono font-bold outline-none focus:border-purple-500" 
                      />
                      <button 
                        onClick={applyPromoCode}
                        disabled={verifyingPromo || !promoCode.trim()}
                        className="px-4 bg-slate-900 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                      >
                        {verifyingPromo ? 'A verificar...' : 'Aplicar'}
                      </button>
                    </div>
                    {promoError && <p className="text-rose-500 text-xs font-bold">{promoError}</p>}
                    {couponApplied && <p className="text-emerald-500 text-xs font-bold">Cupão {couponApplied.code} aplicado com sucesso!</p>}
                  </div>
`;

code = code.replace(notesSearch, promoInputHTML + "\n                  " + notesSearch);

// Check if couponDiscount is in final reservation
// The file has: const finalPriceToPay = Math.max(0, Number((totalServicesPrice - couponDiscount).toFixed(2)));
// WAIT: The code ALREADY had `couponDiscount` in the finalPrice calculation! But it might not be defined. Let's make sure we declare it if it wasn't.
// Wait, I saw `const finalPriceToPay = Math.max(0, Number((totalServicesPrice - couponDiscount).toFixed(2)));` in the grep output.
// Did the author already try to do this? Let's verify `couponDiscount` in the original code.

fs.writeFileSync('src/components/BookingModal.tsx', code);
