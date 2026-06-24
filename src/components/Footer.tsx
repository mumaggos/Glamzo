import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 mt-auto bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 mb-4 whitespace-nowrap">Glamzo</h4>
            <p className="text-sm text-slate-600 mb-4 pr-4">
              O principal marketplace ibérico para agendamentos online nos melhores espaços de beleza e bem-estar.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">A Empresa</h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/sobre-nos" className="hover:text-purple-600 focus:outline-none focus:underline">Sobre a Glamzo</Link></li>
              <li><Link to="/contactos" className="hover:text-purple-600 focus:outline-none focus:underline">Contactos</Link></li>
              <li><Link to="/faq-cliente" className="hover:text-purple-600 focus:outline-none focus:underline">FAQ Cliente</Link></li>
              <li><Link to="/faq-parceiro" className="hover:text-purple-600 focus:outline-none focus:underline">FAQ Parceiro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Suporte Legal</h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/termos-e-condicoes" className="hover:text-purple-600 focus:outline-none focus:underline">Termos e Condições</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:text-purple-600 focus:outline-none focus:underline">Política de Privacidade</Link></li>
              <li><Link to="/politica-de-pagamentos" className="hover:text-purple-600 focus:outline-none focus:underline">Termos de Pagamentos</Link></li>
              <li><Link to="/politica-de-cancelamentos" className="hover:text-purple-600 focus:outline-none focus:underline">Cancelamentos & Reembolsos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Para Parceiros</h4>
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
