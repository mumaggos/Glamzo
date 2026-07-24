import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function PaymentSuccess() {
    const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const businessIdParam = searchParams.get("biz_id");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!user) return;
      try {
        let bizId = businessIdParam;
        if (!bizId) {
          const { data } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .maybeSingle();
          if (data) bizId = data.id;
        }

        if (!bizId) throw new Error("Negócio não encontrado.");

        const res = await fetch("/api/stripe/verify-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: bizId, sessionId: sessionId || undefined }),
        });

        const data = await res.json();
        
        if (res.ok && data.success) {
          setStatus("success");
          setTimeout(() => {
             navigate("/partner/setup?step=5", { replace: true });
          }, 3000);
        } else {
           // Maybe still processing webhook or failed
           setStatus("error");
           setErrorMsg(data.error || "O plano não pôde ser verificado neste momento.");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Falha na comunicação.");
      }
    };

    verify();
  }, [user, sessionId, businessIdParam, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">
        {status === "loading" && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-6" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">A confirmar pagamento...</h1>
            <p className="text-sm text-slate-500 font-medium">Por favor aguarde enquanto sincronizamos com segurança a sua conta através dos servidores Glamzo Pay. Isto pode demorar alguns segundos.</p>
          </div>
        )}
        
        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-6" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Subscrição Ativada!</h1>
            <p className="text-sm text-slate-500 font-medium mb-6">O seu pagamento foi processado com sucesso. Pode agora concluir a configuração da sua loja.</p>
            <button onClick={() => navigate("/partner/setup?step=5", { replace: true })} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs">Continuar Configuração</button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-fade-in">
            <XCircle className="w-16 h-16 text-rose-500 mb-6" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Aviso de Sincronização</h1>
            <p className="text-sm text-rose-500 font-medium mb-6">{errorMsg}</p>
            <p className="text-xs text-slate-500 mb-6">Pode demorar até um minuto para o webhook ser recebido. O sistema atualizará automaticamente assim que for confirmado pelo banco.</p>
            <button onClick={() => navigate("/partner/setup")} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-xl font-bold uppercase tracking-wider text-xs">Voltar à Configuração</button>
          </div>
        )}
      </div>
    </div>
  );
}
