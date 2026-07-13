import React from 'react';
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff') || location.pathname.startsWith('/partner/dashboard');
  
  if (isDashboardOrAdmin) return null;
  return (
    <footer className="border-t border-slate-100 mt-auto bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 mb-4 whitespace-nowrap">Glamzo</h2>
            <p className="text-sm text-slate-600 mb-4 pr-4">
              O marketplace ibérico que liga os clientes mais exigentes aos melhores profissionais de beleza e bem-estar.
            </p>
            {/* Botão Trustpilot */}
            <div className="mt-6">
              <a 
                href="https://pt.trustpilot.com/review/glamzo.pt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition group"
              >
                <div className="w-8 h-8 bg-[#00B67A] rounded flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 512 512" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M256 36.8l56.5 174.1h183.1L347.5 318.5l56.5 174.1L256 384.9 108 492.6l56.5-174.1L16.4 210.9h183.1L256 36.8z"/>
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Avalie-nos no</span>
                  <span className="text-sm font-black text-slate-900 leading-none mt-1">Trustpilot</span>
                </div>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4">A Empresa</h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/sobre-nos" className="hover:text-purple-600 focus:outline-none focus:underline">Sobre a Glamzo</Link></li>
              <li><Link to="/contactos" className="hover:text-purple-600 focus:outline-none focus:underline">Contactos</Link></li>
              <li><Link to="/faq-cliente" className="hover:text-purple-600 focus:outline-none focus:underline">FAQ Cliente</Link></li>
              <li><Link to="/faq-parceiro" className="hover:text-purple-600 focus:outline-none focus:underline">FAQ Parceiro</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">Suporte Legal</h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/termos-e-condicoes" className="hover:text-purple-600 focus:outline-none focus:underline">Termos e Condições</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:text-purple-600 focus:outline-none focus:underline">Política de Privacidade</Link></li>
              <li><Link to="/politica-de-pagamentos" className="hover:text-purple-600 focus:outline-none focus:underline">Termos de Pagamentos</Link></li>
              <li><Link to="/politica-de-cancelamentos" className="hover:text-purple-600 focus:outline-none focus:underline">Cancelamentos & Reembolsos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">Para Parceiros</h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/partner" className="hover:text-purple-600 font-medium text-slate-900 focus:outline-none focus:underline">Descubra o Glamzo PRO</Link></li>
              <li><Link to="/partner/login" className="hover:text-purple-600 focus:outline-none focus:underline">Login do Parceiro</Link></li>
              <li><Link to="/partner/signup" className="hover:text-purple-600 focus:outline-none focus:underline">Registe o seu Salão</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
          <div>Glamzo © {new Date().getFullYear()}. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
