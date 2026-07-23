const fs = require('fs');

let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Replace labels in Admin tabs
code = code.replace(/label: 'Clientes Finais \(CRM\)'/g, "label: t('admin_users') || 'Clientes Finais (CRM)'");
code = code.replace(/label: 'Funil & Abandonos ⚠️'/g, "label: t('admin_funnel') || 'Funil & Abandonos ⚠️'");
code = code.replace(/label: 'Equipas de Vendas'/g, "label: t('admin_sales_teams') || 'Equipas de Vendas'");
code = code.replace(/label: 'Gestão de Cupões'/g, "label: t('admin_club') || 'Gestão de Cupões'");
code = code.replace(/label: 'Payouts & Planários'/g, "label: t('admin_payouts') || 'Payouts & Planários'");
code = code.replace(/label: 'Disputas & Tickets'/g, "label: t('admin_support') || 'Disputas & Tickets'");
code = code.replace(/label: 'Gestão de Lojas & Modo Deus'/g, "label: t('admin_terminal') || 'Gestão de Lojas & Modo Deus'");
code = code.replace(/label: 'Analytics Globais'/g, "label: t('admin_analytics') || 'Analytics Globais'");

fs.writeFileSync('src/pages/Admin.tsx', code);
