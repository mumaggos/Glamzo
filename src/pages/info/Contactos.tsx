import React, { useState } from 'react';
import ContentLayout from '../../components/ContentLayout';

export default function Contactos() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.assunto || !formData.mensagem) {
      alert("Por favor, preencha todos os campos do formulário para poder enviar.");
      return;
    }

    setStatus('submitting');
    
    // Simulate API call and spam protection delay
    setTimeout(() => {
      setStatus('success');
      setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <ContentLayout title="Contactos" lastUpdated="18 de Junho de 2026">
      <p>
        Para apoio oficial à navegação e esclarecimentos para as suas marcações comerciais, utilize a estrutura abaixo para comunicar formalmente com as equipas de intervenção ao cliente e parceiro.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
        <div>
          <h3>Canais e Apoio a Clientes</h3>
          <p className="mb-2"><strong>Apoio Principal via Email:</strong><br /> <a href="mailto:glamzo.suporte@gmail.com">glamzo.suporte@gmail.com</a></p>
          <p className="mb-2"><strong>Atendimento e Expedição:</strong><br /> Segunda a Sexta, das 09h00 às 18h00</p>
          <p><strong>Tempo Médio de Resposta:</strong><br /> Prometemos contacto até 48H úteis na plataforma de correio.</p>

          <h3 className="mt-8">Canais de Ajuda Corporativos (Parceiros)</h3>
          <p className="text-sm text-slate-600">
            Apoio especial em Faturações Complexas (Revisões, Taxas IVA, Emissão Financeira)<br />
            Configuração da integração do Gateway da Stripe e payouts em Salões.<br />
            Questões avançadas das subscrições das Vantagens PRO da Loja.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="mt-0 mb-6 text-xl">Envie-nos a sua mensagem</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                id="nome"
                type="text"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                placeholder="O seu nome"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Endereço de Email</label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                placeholder="nome@exemplo.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="assunto" className="block text-sm font-medium text-slate-700 mb-1">Assunto Geral</label>
              <select
                id="assunto"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                value={formData.assunto}
                onChange={e => setFormData({ ...formData, assunto: e.target.value })}
                required
              >
                <option value="" disabled>Selecione um tópico...</option>
                <option value="Apoio Geral Reserva">Apoio a Reservas ou Clientes</option>
                <option value="Aderir como Parceiro">Inscrição & Salões</option>
                <option value="Faturação e Stripe">Pagamentos e Recebimentos Financeiros</option>
                <option value="RGPD e Privacidade">Questões Legais (RGPD)</option>
                <option value="Outro">Outro assunto</option>
              </select>
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-medium text-slate-700 mb-1">Mensagem</label>
              <textarea
                id="mensagem"
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Descreva detalhadamente a sua solicitação..."
                value={formData.mensagem}
                onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                required
              />
            </div>

            {status === 'success' && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm border border-emerald-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Mensagem submetida e enviada aos nossos assistentes com sucesso!
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-2 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:bg-purple-400"
            >
              {status === 'submitting' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  A processar...
                </>
              ) : (
                'Submeter Pedido'
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-1">Ao submeter o pedido, está de acordo com as nossas diretrizes gerais do website protegidos via ReCaptcha/Honeypot Anti-Spam.</p>
          </form>
        </div>
      </div>
    </ContentLayout>
  );
}
