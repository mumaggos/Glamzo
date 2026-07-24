import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContentLayout from '../../components/ContentLayout';

export default function Contactos() {
  const { t } = useTranslation();
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
      alert(t('info.contacts.alertFillAll'));
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
    <ContentLayout title={t('info.contacts.title')} lastUpdated={t('info.contacts.lastUpdated')}>
      <p>
        {t('info.contacts.intro')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
        <div>
          <h3>{t('info.contacts.clientSupportTitle')}</h3>
          <p className="mb-2"><strong>{t('info.contacts.mainEmail')}:</strong><br /> <a href="mailto:glamzo.suporte@gmail.com">glamzo.suporte@gmail.com</a></p>
          <p className="mb-2"><strong>{t('info.contacts.hours')}:</strong><br /> {t('info.contacts.hoursDesc')}</p>
          <p><strong>{t('info.contacts.responseTime')}:</strong><br /> {t('info.contacts.responseTimeDesc')}</p>

          <h3 className="mt-8">{t('info.contacts.corporateSupportTitle')}</h3>
          <p className="text-sm text-slate-600">
            {t('info.contacts.corporateSupportDesc1')}<br />
            {t('info.contacts.corporateSupportDesc2')}<br />
            {t('info.contacts.corporateSupportDesc3')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="mt-0 mb-6 text-xl">{t('info.contacts.sendMessageTitle')}</h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">{t('info.contacts.fullName')}</label>
              <input
                id="nome"
                type="text"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                placeholder={t('info.contacts.fullNamePlaceholder')}
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">{t('info.contacts.emailAddress')}</label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                placeholder={t('info.contacts.emailPlaceholder')}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="assunto" className="block text-sm font-medium text-slate-700 mb-1">{t('info.contacts.subject')}</label>
              <select
                id="assunto"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                value={formData.assunto}
                onChange={e => setFormData({ ...formData, assunto: e.target.value })}
                required
              >
                <option value="" disabled>{t('info.contacts.selectTopic')}</option>
                <option value="Apoio Geral Reserva">{t('info.contacts.topic1')}</option>
                <option value="Aderir como Parceiro">{t('info.contacts.topic2')}</option>
                <option value="Faturação e Stripe">{t('info.contacts.topic3')}</option>
                <option value="RGPD e Privacidade">{t('info.contacts.topic4')}</option>
                <option value="Outro">{t('info.contacts.topic5')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-medium text-slate-700 mb-1">{t('info.contacts.message')}</label>
              <textarea
                id="mensagem"
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all resize-none"
                placeholder={t('info.contacts.messagePlaceholder')}
                value={formData.mensagem}
                onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                required
              />
            </div>

            {status === 'success' && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm border border-emerald-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {t('info.contacts.successMsg')}
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
                  {t('info.contacts.processing')}
                </>
              ) : (
                t('info.contacts.submitBtn')
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-1">{t('info.contacts.disclaimer')}</p>
          </form>
        </div>
      </div>
    </ContentLayout>
  );
}
