import React from 'react';
import { Link } from 'react-router-dom';
import GlamzoLogo from './GlamzoLogo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <GlamzoLogo size={28} />
            <p className="text-slate-500 text-sm mt-4 leading-relaxed">
              A plataforma líder de serviços de beleza e bem-estar. Reserve os melhores profissionais perto de si.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Para Clientes</h4>
            <ul className="space-y-2.5">
              <li><Link to="/explore" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Explorar Serviços</Link></li>
              <li><Link to="/faq/cliente" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Perguntas Frequentes</Link></li>
              <li><Link to="/legal/cancelamentos" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Política de Cancelamento</Link></li>
              <li><Link to="/login" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Login Cliente</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Para Parceiros</h4>
            <ul className="space-y-2.5">
              <li><Link to="/partner" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Junte-se a nós</Link></li>
              <li><Link to="/faq/parceiro" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Centro de Ajuda Parceiros</Link></li>
              <li><Link to="/partner/login" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Portal do Parceiro</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 mb-4">Legal & Empresa</h4>
            <ul className="space-y-2.5">
              <li><Link to="/legal/termos" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Termos e Condições</Link></li>
              <li><Link to="/legal/privacidade" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/legal/cookies" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Política de Cookies</Link></li>
              <li><Link to="/legal/seguranca-rgpd" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Segurança & RGPD</Link></li>
              <li><Link to="/legal/pagamentos" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Pagamentos Stripe</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Glamzo Premium Marketplace © {new Date().getFullYear()}. Todos os direitos reservados.
          </div>
          <div className="flex gap-4">
            <a href="mailto:suporte@glamzo.pt" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Contactos</a>
            <Link to="/admin/login" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
