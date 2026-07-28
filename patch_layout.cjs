const fs = require('fs');
let code = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

// replace the old stripe warning top banner with the new banner
const oldBanner = `{business && business.subscription_active !== false && business.subscription_status !== 'canceled' && !business.stripe_account_id && showStripeWarning && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 text-center text-sm font-bold shadow-sm relative z-[999999] animate-in fade-in slide-in-from-top-4">
            {t('partner.stripeWarning')} <LocalizedLink to="/partner/dashboard/subscricao" className="underline decoration-2 underline-offset-2 hover:text-rose-100 transition-colors">{t('partner.stripeLink')}</LocalizedLink>
          </div>
        )}`;

code = code.replace(oldBanner, '');

// Also import StripeActivationBanner
if (!code.includes('StripeActivationBanner')) {
  code = code.replace(
    'import GlamzoLogo from "../../components/GlamzoLogo";',
    'import GlamzoLogo from "../../components/GlamzoLogo";\nimport { StripeActivationBanner } from "./StripeActivationBanner";'
  );
}

// Add the banner right before <Outlet />
code = code.replace(
  '<Outlet context={{ business, tabletOrder, bookingsTodayCount }} />',
  '<div className="px-4 sm:px-8 mt-6"><StripeActivationBanner business={business} user={user} /></div>\n              <Outlet context={{ business, tabletOrder, bookingsTodayCount }} />'
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', code);
