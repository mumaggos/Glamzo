const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

const importsToReplace = `
import Home from './pages/Home';
import Explore from './pages/Explore';
import BusinessDetail from './pages/BusinessDetail';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import UpdatePassword from './pages/UpdatePassword';
import Partner from './pages/Partner';
import PartnerLogin from './pages/PartnerLogin';
import PartnerSignup from './pages/PartnerSignup';
import SetupWizard from './pages/partner/SetupWizard';
import PaymentSuccess from './pages/partner/PaymentSuccess';
import PartnerLayout from './components/partner/PartnerLayout';
import OverviewTab from './pages/partner/tabs/OverviewTab';
import AgendaTab from './pages/partner/tabs/AgendaTab';
import ServicesTab from './pages/partner/tabs/ServicesTab';
import StaffTab from './pages/partner/tabs/StaffTab';
import ClientsTab from './pages/partner/tabs/ClientsTab';
import HoursTab from './pages/partner/tabs/HoursTab';
import FinanceTab from './pages/partner/tabs/FinanceTab';
import StoreAssetsTab from './pages/partner/tabs/StoreAssetsTab';
import SettingsTab from './pages/partner/tabs/SettingsTab';
import { ReservationsTab } from './pages/partner/tabs/ReservationsTab';
import { MarketingTab } from './pages/partner/tabs/MarketingTab';
import MessagesTab from './pages/partner/tabs/MessagesTab';
import TabletTab from './pages/partner/tabs/TabletTab';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import SuperAdminLogistics from './pages/admin/SuperAdminLogistics';
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';
import StripeSimulatedCheckout from './pages/StripeSimulatedCheckout';
import StripeSimulatedConnect from './pages/StripeSimulatedConnect';
import SupabaseSetupHelper from './components/SupabaseSetupHelper';
import GlamzoMessenger from './components/GlamzoMessenger';
import Termos from './pages/legal/Termos';
import Privacidade from './pages/legal/Privacidade';
import Cookies from './pages/legal/Cookies';
import Cancelamentos from './pages/legal/Cancelamentos';
import Pagamentos from './pages/legal/Pagamentos';
import Seguranca from './pages/legal/Seguranca';
import FaqCliente from './pages/info/FaqCliente';
import FaqParceiro from './pages/info/FaqParceiro';
import Sobre from './pages/info/Sobre';
import Contactos from './pages/info/Contactos';
`;

const lazyImports = `
import React, { useEffect, Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const BusinessDetail = lazy(() => import('./pages/BusinessDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Account = lazy(() => import('./pages/Account'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const Partner = lazy(() => import('./pages/Partner'));
const PartnerLogin = lazy(() => import('./pages/PartnerLogin'));
const PartnerSignup = lazy(() => import('./pages/PartnerSignup'));
const SetupWizard = lazy(() => import('./pages/partner/SetupWizard'));
const PaymentSuccess = lazy(() => import('./pages/partner/PaymentSuccess'));
const PartnerLayout = lazy(() => import('./components/partner/PartnerLayout'));
const OverviewTab = lazy(() => import('./pages/partner/tabs/OverviewTab'));
const AgendaTab = lazy(() => import('./pages/partner/tabs/AgendaTab'));
const ServicesTab = lazy(() => import('./pages/partner/tabs/ServicesTab'));
const StaffTab = lazy(() => import('./pages/partner/tabs/StaffTab'));
const ClientsTab = lazy(() => import('./pages/partner/tabs/ClientsTab'));
const HoursTab = lazy(() => import('./pages/partner/tabs/HoursTab'));
const FinanceTab = lazy(() => import('./pages/partner/tabs/FinanceTab'));
const StoreAssetsTab = lazy(() => import('./pages/partner/tabs/StoreAssetsTab'));
const SettingsTab = lazy(() => import('./pages/partner/tabs/SettingsTab'));
const ReservationsTab = lazy(() => import('./pages/partner/tabs/ReservationsTab'));
const MarketingTab = lazy(() => import('./pages/partner/tabs/MarketingTab'));
const MessagesTab = lazy(() => import('./pages/partner/tabs/MessagesTab'));
const TabletTab = lazy(() => import('./pages/partner/tabs/TabletTab'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const SuperAdminLogistics = lazy(() => import('./pages/admin/SuperAdminLogistics'));
const StaffLogin = lazy(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StripeSimulatedCheckout = lazy(() => import('./pages/StripeSimulatedCheckout'));
const StripeSimulatedConnect = lazy(() => import('./pages/StripeSimulatedConnect'));
const Termos = lazy(() => import('./pages/legal/Termos'));
const Privacidade = lazy(() => import('./pages/legal/Privacidade'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));
const Cancelamentos = lazy(() => import('./pages/legal/Cancelamentos'));
const Pagamentos = lazy(() => import('./pages/legal/Pagamentos'));
const Seguranca = lazy(() => import('./pages/legal/Seguranca'));
const FaqCliente = lazy(() => import('./pages/info/FaqCliente'));
const FaqParceiro = lazy(() => import('./pages/info/FaqParceiro'));
const Sobre = lazy(() => import('./pages/info/Sobre'));
const Contactos = lazy(() => import('./pages/info/Contactos'));
import SupabaseSetupHelper from './components/SupabaseSetupHelper';
import GlamzoMessenger from './components/GlamzoMessenger';
`;

text = text.replace("import React, { useEffect } from 'react';", '');

// Strip individual imports
const importLines = importsToReplace.trim().split('\n');
importLines.forEach(line => {
   if(line) {
      text = text.replace(line.trim(), '');
   }
});

text = lazyImports + text;

// wrap Routes in Suspense
const fallbackLoader = '<div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>';
text = text.replace('<Routes>', '<Suspense fallback={' + fallbackLoader + '}><Routes>');
text = text.replace('</Routes>', '</Routes></Suspense>');

fs.writeFileSync('src/App.tsx', text);
