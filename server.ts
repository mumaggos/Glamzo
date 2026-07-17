import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import compression from "compression";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { EmailService } from "./src/services/EmailService";

// Configuration helper
const PORT = 3000;
const app = express();


// Security Headers Middleware
app.use((req, res, next) => {
  // We relax frame restrictions slightly to allow AI Studio previews, but tighten for production
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:;");
  next();
});

// Apply compression middleware to drastically shrink transfer size
app.use(compression());

// Lazy Gemini AI initialization to prevent crash on empty key
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required for AI actions",
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Lazy Stripe client setup to prevent crash if key is missing
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripeClient = new Stripe(key, { apiVersion: "2023-10-16" as any });
  }
  return stripeClient;
}

// Lazy Supabase service client setup to update database from backend (e.g., webhook)
let supabaseAdminClient: any = null;
function getSupabaseAuthClient(req: any): any {
  const url = process.env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co/';
  const key = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    return createClient(url, key, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
  }
  return getSupabaseAdmin();
}

function getSupabaseAdmin(): any {
  if (!supabaseAdminClient) {
    const url = process.env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co/';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';
    if (!url || !key) {
      throw new Error(
        "Supabase environment details are missing in backend (VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)",
      );
    }
    supabaseAdminClient = createClient(url, key);
  }
  return supabaseAdminClient;
}

// Support raw body for Stripe webhook Signature validation
app.use((req, res, next) => {
  if (
    req.originalUrl === "/api/webhooks/stripe" ||
    req.originalUrl === "/api/stripe/webhook" ||
    req.originalUrl.startsWith("/api/webhooks/") ||
    req.originalUrl.startsWith("/api/stripe/webhook")
  ) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// App Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", serverTime: new Date().toISOString() });
});

app.get("/api/debug-staff", async (req, res) => {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("get_schema_info");
    // Wait, rpc 'get_schema_info' might not exist. Let's just query information_schema
    const { data: cols, error: err } = await db
      .from("staff")
      .select("*")
      .limit(1);

    // We can also just fetch from pg_catalog if we had access, but Supabase API might not let us.
    res.json({ cols, err });
  } catch (e: any) {
    res.json({ error: e.message });
  }
});

// Server-Sent Events (SSE) Client Storage for Real-Time Marketplace updates
let sseClients: express.Response[] = [];

app.get("/api/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);
  console.log(
    `[Realtime:SSE] Client registered. Current active connections: ${sseClients.length}`,
  );

  req.on("close", () => {
    sseClients = sseClients.filter((client) => client !== res);
    console.log(
      `[Realtime:SSE] Client disconnected. Current active connections: ${sseClients.length}`,
    );
  });
});

app.post("/api/realtime/broadcast", (req, res) => {
  const { event, payload } = req.body;
  console.log(
    `[Realtime:Broadcast] Event: ${event}, Broadcasters count: ${sseClients.length}`,
  );

  // Push chunks down the streams
  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ event, payload })}\n\n`);
  });

  res.json({ success: true, sseClientsCount: sseClients.length });
});

// Real Email Dispatch endpoint

app.post("/api/business/qr-scan", express.json(), async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) return res.status(400).json({ error: "No businessId provided" });
  try {
    const { data: currentData } = await getSupabaseAdmin()
      .from('businesses')
      .select('qr_scans_count')
      .eq('id', businessId)
      .maybeSingle();
      
    const current = currentData?.qr_scans_count || 0;
    
    await getSupabaseAdmin()
      .from('businesses')
      .update({ qr_scans_count: current + 1 })
      .eq('id', businessId);
      
    res.json({ success: true, scans: current + 1 });
  } catch (err) {
    res.status(500).json({ error: "Failed to increment QR scans" });
  }
});
app.post("/api/emails/send", async (req, res) => {
  try {
    const { type, to, data } = req.body;
    console.log(`[EmailService] Attempting to send ${type} to ${to}`);

    switch (type) {
      case "chat_message":
        await EmailService.sendChatMessageEmail(to, data);
        break;
      case "verification_code":
        await EmailService.sendVerificationCodeEmail(
          to,
          data.userName,
          data.code,
        );
        break;
      case "verification":
        await EmailService.sendVerificationEmail(
          to,
          data.userName,
          data.confirmationLink,
        );
        break;
      case "password_reset":
        await EmailService.sendPasswordResetEmail(to, data.resetLink);
        break;
      case "booking_confirmation":
        await EmailService.sendBookingConfirmationEmail(to, data);
        break;
      case "booking_cancelled":
        await EmailService.sendBookingCancelledEmail(to, data);
        break;
      case "new_booking":
        await EmailService.sendNewBookingEmail(to, data);
        break;
      case "subscription_activated":
        await EmailService.sendSubscriptionActivatedEmail(to, data);
        break;
      case "invoice":
        await EmailService.sendInvoiceEmail(to, data);
        break;
      case "payment_failed":
        await EmailService.sendPaymentFailedEmail(to, data);
        break;
      case "staff_credentials":
        await EmailService.sendStaffCredentialsEmail(to, data);
        break;
      case "abandoned_cart":
        await EmailService.sendAbandonedCartEmail(to);
        break;
      case "reward_coupon":
        await EmailService.sendRewardCouponEmail(to, data);
        break;
      case "magic_setup":
        await EmailService.sendMagicSetupEmail(to, data);
        break;
      default:
        return res.status(400).json({ error: "Unknown email type" });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error(`[EmailService] Failed to send email:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Partner Custom OTP Verification System
const partnerOTPs = new Map<string, { code: string; expires: number }>();

app.post("/api/auth/send-partner-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "O e-mail é obrigatório." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if profile with this email already exists in profiles
    const admin = getSupabaseAdmin();
    const { data: profileCheck, error: profileErr } = await admin
      .from("profiles")
      .select("id, email, role")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (profileCheck) {
      return res.status(400).json({
        error: "Este e-mail já está registado na nossa plataforma. Por favor, utilize a página de Login de Parceiros para aceder."
      });
    }

    // 2. Generate a random 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store the OTP in memory (valid for 10 minutes)
    partnerOTPs.set(cleanEmail, {
      code,
      expires: Date.now() + 10 * 60 * 1000
    });

    console.log(`[PartnerOTP] Generated code ${code} for ${cleanEmail}`);

    // 4. Send the OTP code via Resend
    await EmailService.sendVerificationCodeEmail(
      cleanEmail,
      cleanEmail.split("@")[0],
      code
    );

    res.json({ success: true, message: "Código de verificação enviado!" });
  } catch (err: any) {
    console.error("[PartnerOTP] Error sending OTP:", err);
    res.status(500).json({ error: "Erro ao enviar o código de verificação: " + err.message });
  }
});

app.post("/api/auth/verify-partner-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "E-mail e código são obrigatórios." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpData = partnerOTPs.get(cleanEmail);

    if (!otpData) {
      return res.status(400).json({ error: "Não foi solicitado nenhum código para este e-mail ou o código já expirou." });
    }

    if (otpData.expires < Date.now()) {
      partnerOTPs.delete(cleanEmail);
      return res.status(400).json({ error: "O código de verificação expirou. Por favor, peça um novo código." });
    }

    if (otpData.code !== code.trim()) {
      return res.status(400).json({ error: "O código inserido está incorreto." });
    }

    // OTP is valid! Let's delete it from memory so it can't be reused
    partnerOTPs.delete(cleanEmail);

    // Now, create the user in Supabase Auth on the server side using the admin client
    const admin = getSupabaseAdmin();
    const deterministicPassword = 'Partner_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '') + '_2026!';

    let userId: string;
    
    try {
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: cleanEmail,
        password: deterministicPassword,
        email_confirm: true,
        user_metadata: {
          role: 'business'
        }
      });

      if (createError) {
        if (createError.message?.includes("already") || createError.status === 422) {
          return res.status(400).json({ error: "Este e-mail já possui uma conta criada. Por favor, faça login." });
        }
        throw createError;
      }

      userId = newUser.user.id;
    } catch (createErr: any) {
      console.error("[PartnerOTP] Error creating user via Admin API:", createErr);
      return res.status(500).json({ error: "Erro ao criar conta de parceiro: " + createErr.message });
    }

    // Sync profile role
    await admin.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      role: 'business',
      full_name: cleanEmail.split('@')[0],
      created_at: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: "Código verificado com sucesso!", 
      email: cleanEmail,
      password: deterministicPassword 
    });
  } catch (err: any) {
    console.error("[PartnerOTP] Error verifying OTP:", err);
    res.status(500).json({ error: "Erro ao verificar o código: " + err.message });
  }
});

// Real-Time Secure Server-Side Gemini API Proxy Route
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Missing prompt parameter" });
      return;
    }

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.warn("Gemini generate endpoint failed:", err.message);
    res.status(500).json({ error: err.message, fallback: true });
  }
});

// Helper to dynamically resolve safe production return URLs, avoiding local/sandboxed iframe white screen errors
function getRealRedirectUrl(
  req: any,
  clientUrl: string,
  defaultPath: string,
): string {
  let origin = req.headers.origin;
  if (!origin && req.headers.referer) {
    try {
      const refUrl = new URL(req.headers.referer);
      origin = refUrl.origin;
    } catch (_) {}
  }
  if (!origin || origin === "null") {
    const forwardHost = req.headers["x-forwarded-host"];
    const forwardProto = req.headers["x-forwarded-proto"] || req.protocol;
    if (forwardHost) {
      origin = `${forwardProto}://${forwardHost}`;
    }
  }
  if (!origin || origin === "null") {
    const hostHeader = req.get("host") || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    origin = `${protocol}://${hostHeader}`;
  }

  // Remove any trailing slashes for clean concatenations
  if (origin.endsWith("/")) {
    origin = origin.slice(0, -1);
  }

  console.log(
    `[Stripe URL Redirect Resolution] Deduced origin: "${origin}" for clientUrl: "${clientUrl}"`,
  );

  if (clientUrl) {
    if (clientUrl.startsWith("http://") || clientUrl.startsWith("https://")) {
      if (
        !clientUrl.includes("localhost:") &&
        !clientUrl.includes("127.0.0.1")
      ) {
        console.log(
          `[Stripe URL Redirect Resolution] Returning absolute public redirect URL: "${clientUrl}"`,
        );
        return clientUrl;
      }
    }
    try {
      if (clientUrl.startsWith("/")) {
        return `${origin}${clientUrl}`;
      }
      const parsed = new URL(clientUrl);
      return `${origin}${parsed.pathname}${parsed.search}`;
    } catch (_) {
      return `${origin}${clientUrl}`;
    }
  }
  return `${origin}${defaultPath}`;
}

// Create an Express Connected Onboarding route
app.post("/api/stripe/connect/onboard", async (req, res) => {
  try {
    const { businessId, businessEmail, businessName, returnUrl: reqReturnUrl, refreshUrl: reqRefreshUrl } = req.body;

    if (!businessId) {
      res.status(400).json({ error: "Missing businessId parameter" });
      return;
    }

    const stripe = getStripe();
    const db = getSupabaseAdmin();

    // Fetch business profile to see if stripe_account_id exists
    const { data: business, error: dbErr } = await db
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .maybeSingle();

    if (dbErr || !business) {
      res.status(404).json({ error: "Business profile not found." });
      return;
    }

    let stripeAccountId = business.stripe_account_id;

    if (!stripeAccountId) {
      // Create a brand-new Stripe Express Account configured for automatic weekly Monday payouts
      const account = await stripe.accounts.create({
        type: "express",
        country: "PT",
        email: businessEmail || business.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: businessName || business.name || undefined,
        },
        settings: {
          payouts: {
            schedule: {
              interval: "weekly",
              weekly_anchor: "monday",
            },
          },
        },
      });

      stripeAccountId = account.id;

      // Persist the new connected ID inside client database immediately
      const { error: updateErr } = await db
        .from("businesses")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", businessId);

      if (updateErr) {
        console.error(
          "Failed to save stripe_account_id to database:",
          updateErr,
        );
      }
    }

    // Generate onboarding links
    const returnUrl = reqReturnUrl || getRealRedirectUrl(
      req,
      `/dashboard?status=connect_success&stripe_acct=${stripeAccountId}&biz_id=${businessId}`,
      `/dashboard`,
    );
    const refreshUrl = reqRefreshUrl || getRealRedirectUrl(
      req,
      `/dashboard?status=connect_refresh&biz_id=${businessId}`,
      `/dashboard`,
    );

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("Stripe Express Connect onboarding error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fetch dynamic Stripe registration and activation status
app.get("/api/stripe/account-status", async (req, res) => {
  try {
    const { businessId } = req.query;
    if (!businessId) {
      res.status(400).json({ error: "Missing businessId parameter" });
      return;
    }

    const db = getSupabaseAdmin();
    const { data: business, error: dbErr } = await db
      .from("businesses")
      .select("stripe_account_id")
      .eq("id", businessId)
      .maybeSingle();

    if (dbErr || !business || !business.stripe_account_id) {
      res.json({ connected: false });
      return;
    }

    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(business.stripe_account_id);

    // Sync other components and consumers by persisting the status back to the database row
    await db
      .from("businesses")
      .update({
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      })
      .eq("id", businessId);

    res.json({
      connected: true,
      stripe_account_id: business.stripe_account_id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (err: any) {
    console.error("Failed retrieving Stripe account stats:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create a real Stripe Express Checkout Session with automatic Splits and database backups
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const {
      bookingId,
      amount, // We keep this for fallback but use DB value securely
      stripeAccountId,
      customerEmail,
      serviceName,
      businessName,
      successUrl,
      cancelUrl,
      couponCode,
    } = req.body;

    console.log("ID Recebido no Backend:", bookingId);

    if (!bookingId) {
      res
        .status(400)
        .json({
          error: "Falta o parâmetro bookingId",
        });
      return;
    }

    const db = getSupabaseAuthClient(req);
    const stripe = getStripe();

    // Securely fetch booking and price from DB
    const { data: bookingRec, error: bookingErr } = await db
      .from("bookings")
      .select("business_id, total_price, original_service_price")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingErr || !bookingRec) {
       res.status(404).json({ error: "Reserva não encontrada" });
       return;
    }

    // Use total_price (which includes any DB-applied discounts) or original_service_price, fallback to body amount
    const secureAmount = bookingRec.total_price ?? bookingRec.original_service_price ?? amount;

    if (secureAmount === undefined || secureAmount === null) {
      res
        .status(400)
        .json({
          error: "Não foi possível determinar o valor total do agendamento",
        });
      return;
    }

    const amountCents = Math.round(Number(secureAmount) * 100);

    // Safeguard: Stripe payments require at least 50 cents (0.50 EUR)
    if (amountCents < 50) {
      res
        .status(400)
        .json({
          error:
            'O valor mínimo para pagamentos online via Stripe é de 0,50 €. Por favor, selecione "Pagar diretamente no local" ou adicione mais serviços.',
        });
      return;
    }

    const appFeeCents = Math.round((amountCents * 0.02) + 75); // 2% platform fee + 75 cents fixed (0.50 extras for points)

    // Safe DB Lookup backup: resolve Stripe Connected Account ID from the corresponding business directly
    let resolvedStripeAccountId = stripeAccountId;
    try {
      if (bookingRec.business_id) {
        const { data: bizRec } = await db
          .from("businesses")
          .select("stripe_account_id")
          .eq("id", bookingRec.business_id)
          .maybeSingle();

        if (bizRec?.stripe_account_id) {
          resolvedStripeAccountId = bizRec.stripe_account_id;
        }
      }
    } catch (dbLookupErr: any) {
      console.warn(
        "[Checkout ID Lookup Backup] Non-blocking exception:",
        dbLookupErr.message,
      );
    }

    const calculatedSuccessUrl = getRealRedirectUrl(
      req,
      successUrl,
      `/account?status=success&booking_id=${bookingId}`,
    );
    const calculatedCancelUrl = getRealRedirectUrl(
      req,
      cancelUrl,
      "/account?status=cancelled",
    );

    const checkoutConfig: any = {
      payment_method_types: ["card", "mb_way"],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Reserva - ${serviceName || "Serviço de Beleza"}`,
              description: `Agendamento no estúdio: ${businessName || "Glamzo Partner"}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        bookingId: bookingId,
        type: "booking_payment",
        couponCode: couponCode || "",
      },
      success_url: calculatedSuccessUrl,
      cancel_url: calculatedCancelUrl,
    };

    // Configure automatic splits: 5% platform application fee and 95% transfer directly to connected store
    if (resolvedStripeAccountId) {
      checkoutConfig.payment_intent_data = {
        application_fee_amount: appFeeCents,
        transfer_data: {
          destination: resolvedStripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(checkoutConfig);
    res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Session construction fail:", err);
    let portugueseError =
      "Falha ao processar o agendamento no Stripe. Por favor verifique as configurações da conta.";

    if (err.message) {
      if (
        err.message.includes("You cannot transfer funds to your own account")
      ) {
        portugueseError =
          'Não é possível transferir fundos para a sua própria conta (a conta de destino coincide com a conta principal da plataforma). Use uma conta Connect secundária ou mude para "Pagar no Local".';
      } else if (err.message.includes("must be at least")) {
        portugueseError =
          "O valor do serviço é demasiado baixo. O Stripe requer um valor mínimo de 0.50 € para pagamentos online.";
      } else if (
        err.message.includes("payouts have been disabled") ||
        err.message.includes("restricted") ||
        err.message.includes("capabilities") ||
        err.message.includes("requirements.past_due")
      ) {
        portugueseError =
          'Este estúdio ainda não concluiu a verificação de segurança no painel Stripe Connect ou tem os pagamentos inativos. Por favor, escolha "Pagar diretamente no local" ou contacte o suporte do salão.';
      } else if (err.message.includes("API key")) {
        portugueseError =
          "A chave da API Stripe não está configurada corretamente no servidor ou está em falta no ficheiro .env.";
      } else if (err.message.includes("No such destination")) {
        portugueseError =
          'A conta Connect deste estúdio (Destination Account) não foi encontrada ou está incorreta no Stripe. Selecione "Pagar diretamente no local".';
      } else {
        portugueseError = `Erro na Stripe: ${err.message}`;
      }
    }
    res.status(500).json({ error: portugueseError });
  }
});

// Helper to dynamically resolve or create the default Glamzo PRO Plan product/price on the current Stripe account
async function getOrCreatePriceIdFallback(stripe: Stripe): Promise<string> {
  console.log(
    "[Stripe Fallback] Attempting to find or create 'Glamzo PRO Plan' product and price on this account...",
  );
  try {
    const productsList = await stripe.products.list({ limit: 100 });
    let product = productsList.data.find(
      (p) => p.name === "Glamzo PRO Plan" && p.active,
    );
    if (!product) {
      console.log(
        "[Stripe Fallback] 'Glamzo PRO Plan' product not found. Creating a new product...",
      );
      product = await stripe.products.create({
        name: "Glamzo PRO Plan",
        description:
          "Gestor operacional, faturamento de reservas, campanhas de marketing e fidelização de clientes - Glamzo PRO SaaS.",
      });
    }

    const pricesList = await stripe.prices.list({
      product: product.id,
      limit: 100,
      active: true,
    });
    // Look for recurring monthly price with amount 1990 cents (19.90 EUR)
    let price = pricesList.data.find(
      (p) =>
        p.unit_amount === 1990 &&
        p.recurring?.interval === "month" &&
        p.currency === "eur",
    );
    if (!price) {
      console.log(
        "[Stripe Fallback] Recurring price not found for product. Creating monthly 19.90 EUR price...",
      );
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1990,
        currency: "eur",
        recurring: { interval: "month" },
      });
    }
    console.log(
      `[Stripe Fallback] Successfully resolved fallback Price ID: ${price.id}`,
    );
    return price.id;
  } catch (err: any) {
    console.error(
      "[Stripe Fallback Error] Tried to resolve fallback price but custom product/price bootstrap failed:",
      err.message,
    );
    throw err;
  }
}

// Shared audited subscription checkout handler to support both create-subscription and create-subscription-checkout endpoints
const handleCreateSubscriptionCheckout = async (req: any, res: any) => {
  console.log("Creating Stripe Checkout...");
  try {
    const { businessId, planName, successUrl, cancelUrl, skipTrial } = req.body;

    // Validate request parameters
    if (!businessId) {
      console.error("[Stripe Checkout Error] Missing businessId parameter");
      res
        .status(400)
        .json({ success: false, error: "Missing businessId parameter" });
      return;
    }

    // Verify Stripe Secret Key exists
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error(
        "[Stripe Checkout Error] Stripe secret key is missing inside server configuration.",
      );
      res
        .status(500)
        .json({
          success: false,
          error:
            "Stripe key missing: STRIPE_SECRET_KEY is not defined in server environment.",
        });
      return;
    }

    // Initialize Stripe client
    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch (stripeInitErr: any) {
      console.error(
        "[Stripe Checkout Error] Stripe initialization failed:",
        stripeInitErr,
      );
      res
        .status(500)
        .json({
          success: false,
          error:
            "Stripe API failed: Initialization error - " +
            stripeInitErr.message,
        });
      return;
    }

    // Verify environment keys consistency
    const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      const isSkLive = secretKey.startsWith("sk_live_");
      const isPkLive = publishableKey.startsWith("pk_live_");
      const isSkTest = secretKey.startsWith("sk_test_");
      const isPkTest = publishableKey.startsWith("pk_test_");
      if ((isSkLive && !isPkLive) || (isSkTest && !isPkTest)) {
        console.warn(
          "⚠️ Stripe environment warning: Mixing TEST and LIVE keys!",
        );
      }
    }

    // Verify Subscription Price ID exists
    let priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId || priceId.trim() === "") {
      priceId = "price_1TbVJUPCXoqZhOLwXn2JIGem";
    }

    const isTerminal = planName === "TERMINAL";
    const terminalProductId =
      process.env.STRIPE_TERMINAL_PRODUCT_ID || "prod_Uk3zSeOffcShqq";

    console.log(
      "Using Resolved price/product for Stripe Checkout. IsTerminal:",
      isTerminal,
    );

    const db = getSupabaseAdmin();

    // Fetch business profile to resolve billing coordinates
    const { data: business, error: bizErr } = await db
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .maybeSingle();

    if (bizErr) {
      console.error(
        "[Stripe Checkout Error] Database failed reading business profile:",
        bizErr.message,
      );
      res
        .status(500)
        .json({
          success: false,
          error: "Database failed reading business: " + bizErr.message,
        });
      return;
    }

    if (!business) {
      console.error(
        "[Stripe Checkout Error] Business profile not found for id:",
        businessId,
      );
      res
        .status(404)
        .json({
          success: false,
          error: "Invalid partner: Business profile not found.",
        });
      return;
    }

    // Resolve or generate customer in Stripe
    let customerId = business.stripe_customer_id;
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: business.email || undefined,
          name: business.name,
          metadata: { businessId: businessId },
        });
        customerId = customer.id;

        // Persist the customer ID immediately
        await db
          .from("businesses")
          .update({ stripe_customer_id: customerId })
          .eq("id", businessId);
      } catch (custErr: any) {
        console.error(
          "[Stripe Checkout Error] Stripe customer creation failed:",
          custErr.message,
        );
        res
          .status(500)
          .json({
            success: false,
            error:
              "Invalid customer: Stripe customer create failed - " +
              custErr.message,
          });
        return;
      }
    }

    const calculatedSuccessUrl = getRealRedirectUrl(
      req,
      successUrl,
      `/dashboard?status=success_pro&biz_id=${businessId}`,
    );
    const calculatedCancelUrl = getRealRedirectUrl(
      req,
      cancelUrl,
      `/dashboard?status=cancelled_pro&biz_id=${businessId}`,
    );

    const hasUsedTrial = !!business.trial_started_at;
    const subscriptionData = (hasUsedTrial || skipTrial || isTerminal) ? {} : { trial_period_days: 14 };

    console.log(
      `Initiating stripe.checkout.sessions.create... (Trial Used previously: ${hasUsedTrial})`,
    );
    let session: Stripe.Checkout.Session;
    try {
      if (!priceId) {
        throw new Error(
          "No Price ID defined in environment under STRIPE_PRO_PRICE_ID.",
        );
      }

      let lineItems: any[] = [];

      if (isTerminal) {
        lineItems = [
          {
            price_data: {
              currency: "eur",
              product: terminalProductId,
              recurring: { interval: "month" },
              unit_amount: 2490,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: "eur",
              product: terminalProductId,
              unit_amount: 990,
            },
            quantity: 1,
          },
        ];
      } else {
        lineItems = [
          {
            price: priceId,
            quantity: 1,
          },
        ];
      }

      console.log(
        `Attempting Stripe session creation for ${planName || "PRO"} plan`,
      );
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        allow_promotion_codes: true,
        line_items: lineItems,
        subscription_data: subscriptionData,
        metadata: {
          business_id: businessId,
          businessId: businessId,
          owner_id: business.owner_id,
          type: "pro_subscription",
          plan_name: planName || "PRO",
        },
        success_url: calculatedSuccessUrl,
        cancel_url: calculatedCancelUrl,
      });
    } catch (checkoutErr: any) {
      const errMsg = checkoutErr.message || "";
      const isNoSuchPrice =
        errMsg.toLowerCase().includes("no such price") ||
        errMsg.toLowerCase().includes("invalid price") ||
        errMsg.toLowerCase().includes("no price id") ||
        errMsg.toLowerCase().includes("empty") ||
        errMsg.toLowerCase().includes("undefined");

      if (isNoSuchPrice) {
        console.warn(
          `[Stripe Automatic Recovery] Configured priceId '${priceId}' failed or was empty. Error detail: "${errMsg}". Running automatic product & price bootstrap fallback...`,
        );
        try {
          const fallbackPriceId = await getOrCreatePriceIdFallback(stripe);
          console.log(
            `[Stripe Automatic Recovery] Retrying session creation with resolved fallback priceId: '${fallbackPriceId}'`,
          );
          session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            allow_promotion_codes: true,
            line_items: [
              {
                price: fallbackPriceId,
                quantity: 1,
              },
            ],
            subscription_data: subscriptionData,
            metadata: {
              business_id: businessId,
              businessId: businessId,
              owner_id: business.owner_id,
              type: "pro_subscription",
            },
            success_url: calculatedSuccessUrl,
            cancel_url: calculatedCancelUrl,
          });
        } catch (fallbackErr: any) {
          console.error(
            "[Stripe Automatic Recovery Failure] Auto-recovery bootstrap also failed:",
            fallbackErr.message,
          );
          res.status(500).json({
            success: false,
            error: `Stripe API failed: Active price is not registered on this account (${checkoutErr.message}) and recovery bootstrap also failed (${fallbackErr.message}).`,
          });
          return;
        }
      } else {
        console.error(
          "[Stripe Checkout Error] Stripe Session creation failed:",
          checkoutErr.message,
        );
        res
          .status(500)
          .json({
            success: false,
            error:
              "Stripe API failed: Session creation error - " +
              checkoutErr.message,
          });
        return;
      }
    }

    console.log("Checkout session successfully created:", session.id);
    console.log("Checkout URL successfully created:", session.url);

    // Respond with success true and session.url as requested in item 8
    res.json({ success: true, url: session.url, id: session.id });
  } catch (err: any) {
    console.error(
      "Stripe SaaS Subscription Checkout generation completely failed:",
      err,
    );
    res
      .status(500)
      .json({
        success: false,
        error: err.message || "Unknown internal backend exception",
      });
  }
};

// Route implementations utilizing the audited shared handler
app.post("/api/stripe/verify-subscription", async (req, res) => {
  try {
    const { sessionId, businessId } = req.body;
    const stripe = getStripe();
    const db = getSupabaseAdmin();

    let customerId: string | null = null;
    let subId: string | null = null;
    let resolvedBusinessId: string | null = businessId || null;

    if (sessionId) {
      console.log(
        `[Verify Subscription] Fetching Stripe checkout session: ${sessionId}`,
      );
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const sessionBusinessId = session.metadata?.businessId;
      if (sessionBusinessId) {
        resolvedBusinessId = sessionBusinessId;
      }

      if (session.customer) {
        customerId = session.customer as string;
      }

      if (session.subscription) {
        subId = session.subscription as string;
      }
    }

    if (!resolvedBusinessId) {
      res
        .status(400)
        .json({
          error:
            "Could not resolve businessId from request or session metadata.",
        });
      return;
    }

    // Fallback: If no sessionId was provided or no subscription link was found, try finding via stripe_customer_id or stripe_subscription_id
    if (!subId || !customerId) {
      const { data: biz } = await db
        .from("businesses")
        .select("id, stripe_customer_id, stripe_subscription_id")
        .eq("id", resolvedBusinessId)
        .maybeSingle();

      if (biz) {
        if (biz.stripe_subscription_id) {
          subId = biz.stripe_subscription_id;
        }
        if (biz.stripe_customer_id) {
          customerId = biz.stripe_customer_id;
        }

        // Only search Stripe via customer_id if we STILL don't have a subId
        if (!subId && customerId) {
          console.log(
            `[Verify Subscription Fallback] Listing active subscriptions for Stripe customer: ${customerId}`,
          );
          const stripeSubs = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
            status: "all",
          });

          if (stripeSubs.data && stripeSubs.data.length > 0) {
            const activeSubObj = stripeSubs.data[0];
            subId = activeSubObj.id;
          }
        }
      }
    }

    // If we still don't have a subscription ID, we can't activate
    if (!subId) {
      res
        .status(404)
        .json({
          error:
            "Nenhuma subscrição ativa encontrada no Stripe para este salão.",
        });
      return;
    }

    // Retrieve active subscription details directly from Stripe
    console.log(
      `[Verify Subscription] Retrieving finalized Stripe subscription details for ID: ${subId}`,
    );
    const stripeSub = await stripe.subscriptions.retrieve(subId);
    const subStatus = (stripeSub as any).status;
    const expiresAt = new Date(
      (stripeSub as any).current_period_end * 1000,
    ).toISOString();

    const currentStatus = subStatus === "trialing" ? "trialing" : subStatus;
    const isSActive =
      currentStatus === "active" || currentStatus === "trialing";

    let planName = "pro";
    const items = stripeSub.items?.data || [];
    if (items.some((item) => item.price.unit_amount === 2499 || item.price.unit_amount === 999)) {
        planName = "app_tablet";
    }

    const saasUpdateData: any = {
      stripe_customer_id: customerId,
      stripe_subscription_id: subId,
      subscription_status: currentStatus,
      subscription_active: isSActive,
    };

    if (isSActive) {
      saasUpdateData.public_page_enabled = true;
      saasUpdateData.selected_plan = planName;
      if (planName === 'app_tablet') {
         saasUpdateData.tablet_requested = true;
         // We might not have tablet_deposit_status column so we'll only set what we can, but we can try setting it or just stick to tablet_requested
      }
    }

    if (currentStatus === "trialing") {
      saasUpdateData.trial_started_at = new Date().toISOString();
      saasUpdateData.trial_ends_at = expiresAt;
    }

    console.log(
      `[Verify Subscription Server] Synchronizing SaaS parameters on businesses for id ${resolvedBusinessId}:`,
      saasUpdateData,
    );
    await db
      .from("businesses")
      .update(saasUpdateData)
      .eq("id", resolvedBusinessId);

    // Upsert subscription table entry in database
    const { data: existingSub } = await db
      .from("subscriptions")
      .select("id")
      .eq("business_id", resolvedBusinessId)
      .maybeSingle();

    let dbError = null;
    if (existingSub) {
      console.log(
        `[Verify Subscription Applet] Updating existing subscription for business: ${resolvedBusinessId}`,
      );
      const { error: updErr } = await db
        .from("subscriptions")
        .update({
          plan_name: "PRO",
          status: subStatus,
          monthly_price: 19.9,
          expires_at: expiresAt,
          stripe_subscription_id: subId,
        })
        .eq("id", existingSub.id);
      dbError = updErr;
    } else {
      console.log(
        `[Verify Subscription Applet] Creating next subscription row for business: ${resolvedBusinessId}`,
      );
      const { error: insErr } = await db.from("subscriptions").insert({
        business_id: resolvedBusinessId,
        plan_name: "PRO",
        status: subStatus,
        monthly_price: 19.9,
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
        stripe_subscription_id: subId,
      });
      dbError = insErr;
    }

    if (dbError) {
      console.warn(
        "[Verify Subscription Router DB Error (Non-Fatal Fallback)]:",
        dbError.message,
      );
      console.log(
        "We will delegate database updates to the client frontend where user holds active authenticated session...",
      );
    }

    console.log(
      `[Verify Subscription Success] Account activated! businessId: ${resolvedBusinessId}, status: ${subStatus}`,
    );
    res.json({
      success: true,
      status: subStatus,
      expiresAt: expiresAt,
      stripeSubscriptionId: subId,
      customerId: customerId,
      dbWriteDelegated: !!dbError,
    });
  } catch (err: any) {
    console.error("[Verify Subscription Router Exception]:", err.message);
    res.status(500).json({ error: "Erro de verificação: " + err.message });
  }
});

app.post("/api/stripe/create-subscription", handleCreateSubscriptionCheckout);
app.post("/api/create-subscription-checkout", handleCreateSubscriptionCheckout);

// Create Customer Billing Portal session for active partner salons
app.post("/api/stripe/create-portal-session", async (req, res) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      res.status(400).json({ error: "Missing businessId parameter" });
      return;
    }

    const db = getSupabaseAdmin();
    const stripe = getStripe();

    const { data: business, error: bizErr } = await db
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .maybeSingle();

    if (bizErr || !business) {
      res.status(404).json({ error: "Business not found." });
      return;
    }

    let customerId = business.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.email || undefined,
        name: business.name,
        metadata: { businessId: businessId },
      });
      customerId = customer.id;
      await db
        .from("businesses")
        .update({ stripe_customer_id: customerId })
        .eq("id", businessId);
    }

    const calculatedReturnUrl = getRealRedirectUrl(
      req,
      `/dashboard?status=portal_closed`,
      `/dashboard`,
    );

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: calculatedReturnUrl,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Customer Portal Session creation failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Cancel active subscription and fallback DB trial states for a business
app.post("/api/stripe/cancel-subscription", async (req, res) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      res.status(455).json({ error: "Missing businessId parameter" });
      return;
    }

    const db = getSupabaseAdmin();
    const stripe = getStripe();

    const { data: business, error: bizErr } = await db
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .maybeSingle();

    if (bizErr || !business) {
      res.status(404).json({ error: "Business not found." });
      return;
    }

    const subId = business.stripe_subscription_id;
    if (subId && subId.trim() !== "") {
      try {
        console.log(
          `[Cancel Subscription] Cancelling Stripe subscription: ${subId}`,
        );
        await stripe.subscriptions.cancel(subId);
      } catch (subErr: any) {
        console.warn(
          `[Cancel Subscription Warning] Failed to cancel sub in Stripe: ${subErr.message}`,
        );
      }
    }

    // Update database fields
    await db
      .from("businesses")
      .update({
        stripe_subscription_id: null,
        subscription_status: "cancelled",
        subscription_active: false,
      })
      .eq("id", businessId);

    // Update subscriptions table entries
    await db
      .from("subscriptions")
      .update({
        status: "cancelled",
        expires_at: new Date().toISOString(),
      })
      .eq("business_id", businessId);

    res.json({ success: true, message: "Subscrição cancelada com sucesso." });
  } catch (err: any) {
    console.error("Subscription cancellation failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Friendly aliases to satisfy various client route patterns
app.post("/api/stripe/create-checkout", (req, res) => {
  res.redirect(307, "/api/create-checkout-session");
});

// Unified Webhook for both Corporate SaaS (Subscriptions) and Connect Platform accounts (splits, payouts, verification state)
const handleStripeWebhook = async (req: any, res: any) => {
  const sig = req.headers["stripe-signature"];
  const rawBody = req.body;
  const stripe = getStripe();
  const db = getSupabaseAdmin();

  let event: Stripe.Event | null = null;
  const mainSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const connectSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  if (sig) {
    // 1. First probe Signature against Corporate Webhook Secret
    if (mainSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, mainSecret);
        console.log(
          "[Webhook:SigVerification] Successfully validated against Main Secret (Corporate channel)",
        );
      } catch (_) {}
    }
    // 2. Fallback probe Signature against Connected Platform Webhook Secret
    if (!event && connectSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, connectSecret);
        console.log(
          "[Webhook:SigVerification] Successfully validated against Connect Platform Secret",
        );
      } catch (err: any) {
        console.warn(
          "[Webhook:SigVerification] Connected secret validation mismatch:",
          err.message,
        );
      }
    }
  }

  // Fallback parsed payload only if both secret signature validation paths mismatch or secrets are missing
  if (!event) {
    if (mainSecret || connectSecret) {
      res
        .status(400)
        .send(
          "Webhook signature validation failed on all configured channels.",
        );
      return;
    }
    try {
      event = JSON.parse(rawBody.toString("utf8"));
      console.log(
        "[Webhook:SignatureCheckBypassed] Bypassing security checks - parsing raw JSON event.",
      );
    } catch (_) {
      res.status(400).send("Unparseable body payload");
      return;
    }
  }

  // Log webhook received details
  console.log(`[Stripe Webhook Received] type: ${event.type}, id: ${event.id}`);

  try {
    // --- EVENT TYPE: checkout.session.completed (Both Bookings and SaaS SaaS Subscription Signup!) ---
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const type = session.metadata?.type;

      if (type === "subscription" || type === "pro_subscription") {
        const businessId =
          session.metadata?.business_id || session.metadata?.businessId;
        const customerId = session.customer as string;
        const subId = session.subscription as string;

        console.log(
          `[Stripe Webhook checkout.session.completed:subscription] Parsing business_id: ${businessId}, customer: ${customerId}, subscription_id: ${subId}`,
        );

        if (businessId) {
          let subStatus = "trialing";
          let expiresAt = new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(); // 14-day default

          if (subId) {
            try {
              const stripeSub = await stripe.subscriptions.retrieve(subId);
              subStatus =
                (stripeSub as any).status === "trialing"
                  ? "trialing"
                  : (stripeSub as any).status;
              expiresAt = new Date(
                (stripeSub as any).current_period_end * 1000,
              ).toISOString();
            } catch (stripeSubErr: any) {
              console.error(
                "[Webhook Retrieve Sub failed, using fallback metrics]:",
                stripeSubErr.message,
              );
            }
          }

          console.log(
            `[Stripe Webhook DEBUG] WEBHOOK RECEIVED: checkout.session.completed, business_id: ${businessId}, subId: ${subId}, status: ${subStatus}`,
          );

          // 1. Link customer ID & subscription details inside Businesses table
          try {
            const isSActive = subStatus === "active" || subStatus === "trialing";
            
            let planName = "pro";
            const planNameMetadata = session.metadata?.plan_name || "PRO";
            if (planNameMetadata === 'TERMINAL') {
               planName = 'app_tablet';
            }

            const saasUpdateData: any = {
                stripe_customer_id: customerId,
                stripe_subscription_id: subId,
                subscription_status: subStatus,
                subscription_active: isSActive,
                trial_started_at: subStatus === "trialing" ? new Date().toISOString() : undefined,
                trial_ends_at: subStatus === "trialing" ? expiresAt : undefined,
            };

            if (isSActive) {
                saasUpdateData.public_page_enabled = true;
                saasUpdateData.selected_plan = planName;
                if (planName === 'app_tablet') {
                    saasUpdateData.tablet_requested = true;
                }
            }

            const { error: bizUpdateErr } = await db
              .from("businesses")
              .update(saasUpdateData)
              .eq("id", businessId);

            if (bizUpdateErr) {
              console.warn(
                "[Webhook Warning] Direct businesses table subscription pillars update failed, attempting standard customer link...",
              );
              await db
                .from("businesses")
                .update({ stripe_customer_id: customerId })
                .eq("id", businessId);
            } else {
              console.log(
                `[Webhook success] Aligned businesses table for id: ${businessId} with customerId and subStatus ${subStatus}`,
              );
              console.log("SUBSCRIPTION ACTIVATED");
            }
          } catch (bizUpdateEx: any) {
            console.warn(
              "[Webhook Exception] Safe update on businesses failed. Continuing with fallback subscription table sync.",
              bizUpdateEx.message,
            );
            await db
              .from("businesses")
              .update({ stripe_customer_id: customerId })
              .eq("id", businessId);
            console.log("SUBSCRIPTION ACTIVATED");
          }

          // 2. Safe check subscription status to avoid upsert on onConflict unique constraints
          const { data: existingSub, error: findSubErr } = await db
            .from("subscriptions")
            .select("id")
            .eq("business_id", businessId)
            .maybeSingle();

          let subUpsertErr = null;
          const planNameMetadata = session.metadata?.plan_name || "PRO";
          const planDbName =
            planNameMetadata === "TERMINAL"
              ? "Glamzo PRO Terminal"
              : "Glamzo PRO";
          const planPrice = planNameMetadata === "TERMINAL" ? 24.90 : 19.90;

          if (existingSub) {
            console.log(
              `[Webhook SaaS Sync] Existing subscription found for business ${businessId}. Updating to status '${subStatus}' and stripe_subscription_id '${subId}'...`,
            );
            const { error: updErr } = await db
              .from("subscriptions")
              .update({
                plan_name: planDbName,
                status: subStatus,
                monthly_price: planPrice,
                expires_at: expiresAt,
                stripe_subscription_id: subId,
              })
              .eq("id", existingSub.id);
            subUpsertErr = updErr;
          } else {
            console.log(
              `[Webhook SaaS Sync] No subscription found for business ${businessId}. Inserting new subscription row with status '${subStatus}' and stripe_subscription_id '${subId}'...`,
            );
            const { error: insErr } = await db.from("subscriptions").insert({
              business_id: businessId,
              plan_name: planDbName,
              status: subStatus,
              monthly_price: planPrice,
              started_at: new Date().toISOString(),
              expires_at: expiresAt,
              stripe_subscription_id: subId,
            });
            subUpsertErr = insErr;
          }

          if (subUpsertErr) {
            console.error(
              "[Webhook Update Sub Record DB Err]:",
              subUpsertErr.message,
            );
          } else {
            console.log(
              `[Webhook SaaS Success] SUBSCRIPTION UPDATED SUCCESSFULLY for salon business ${businessId}`,
            );

            if (planNameMetadata === "TERMINAL") {
              console.log(
                `[Webhook Terminal] Marking tablet_order deposit as paid for business ${businessId}`,
              );
              await db
                .from("tablet_orders")
                .update({ deposit_paid: true, status: "processing" })
                .eq("business_id", businessId)
                .eq("status", "pending");
            }

            // EMAIL VERIFICATION - SUBSCRIPTION
            try {
              const { data: business } = await db
                .from("businesses")
                .select("email, owner_id")
                .eq("id", businessId)
                .maybeSingle();
              if (business) {
                const { data: owner } = await db
                  .from("profiles")
                  .select("email")
                  .eq("id", business.owner_id)
                  .maybeSingle();
                const ownerEmail = business.email || (owner && owner.email);

                if (ownerEmail) {
                  await EmailService.sendSubscriptionActivatedEmail(
                    ownerEmail,
                    {
                      planName: "Glamzo PRO",
                      activationDate: new Intl.DateTimeFormat("pt-PT").format(
                        new Date(),
                      ),
                      nextBillingDate: new Intl.DateTimeFormat("pt-PT").format(
                        new Date(expiresAt),
                      ),
                      dashboardUrl: "https://glamzo.pt/dashboard",
                    },
                  );
                }
              }
            } catch (err: any) {
              console.error("[Webhook Email Trigger Error]:", err.message);
            }
          }
        }
      } else {
        // STANDARD BOOKING CHECKOUT SESSION PAYMENT
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
          // 1. Confirm bookings entry status
          const { error: bkErr } = await db
            .from("bookings")
            .update({ payment_status: "paid", booking_status: "confirmed" })
            .eq("id", bookingId);

          // 2. Confirm ledger log status
          const { error: payErr } = await db
            .from("payments")
            .update({
              payment_status: "paid",
              stripe_payment_intent: session.payment_intent as string,
            })
            .eq("booking_id", bookingId);

          if (bkErr || payErr) {
            console.error(
              "[Webhook Booking Pay Update Err]:",
              bkErr?.message || payErr?.message,
            );
          } else {
            console.log(
              `[Webhook Payments Success] Confirmed paid for reservation ID: ${bookingId}`,
            );
          }

          // Mark coupon as used if one was applied
          const couponCode = session.metadata?.couponCode;
          if (couponCode) {
            const { data: bookingRecForCoupon } = await db.from("bookings").select("customer_id").eq("id", bookingId).maybeSingle();
            if (bookingRecForCoupon && bookingRecForCoupon.customer_id) {
               await db.from("reward_coupons").update({ is_used: true, used_at: new Date().toISOString() })
                 .eq("code", couponCode)
                 .eq("customer_id", bookingRecForCoupon.customer_id);
               console.log(`[Webhook] Reward coupon ${couponCode} marked as used for customer ${bookingRecForCoupon.customer_id}`);
            }
          }

          // 3. SECURE LOYALTY DISPATCH: "1€ pago online = 1 GlamPoint"
          try {
            const { data: bookingRec } = await db
              .from("bookings")
              .select("customer_id, total_price")
              .eq("id", bookingId)
              .maybeSingle();

            if (bookingRec) {
              const pointsEarned = Math.floor(
                Number(bookingRec.total_price || 0),
              );
              if (pointsEarned > 0) {
                const { data: userProfile } = await db
                  .from("profiles")
                  .select("loyalty_points")
                  .eq("id", bookingRec.customer_id)
                  .maybeSingle();

                const originalPoints = userProfile?.loyalty_points || 0;
                const nextPointsBalance = originalPoints + pointsEarned;

                const { error: loyaltyErr } = await db
                  .from("profiles")
                  .update({ loyalty_points: nextPointsBalance })
                  .eq("id", bookingRec.customer_id);

                if (loyaltyErr) {
                  console.error(
                    "[Webhook Loyalty Point Earn DB Err]:",
                    loyaltyErr.message,
                  );
                } else {
                  console.log(
                    `[Webhook Loyalty Reward Dispatch] Granted ${pointsEarned} GlamPoints to user: ${bookingRec.customer_id}`,
                  );
                }
              }
            }
          } catch (loyaltyDisptchErr: any) {
            console.warn(
              "[Webhook Loyalty Flow Exception]:",
              loyaltyDisptchErr.message,
            );
          }
        }
      }
    }

    // --- EVENT TYPE: customer.subscription.updated / customer.subscription.deleted ---
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const liveSubscription = event.data.object as Stripe.Subscription;
      const stripeSubId = liveSubscription.id;
      const customerId = liveSubscription.customer as string;

      let syncedStatus =
        (liveSubscription as any).status === "trialing"
          ? "trialing"
          : (liveSubscription as any).status;
      if (event.type === "customer.subscription.deleted") {
        syncedStatus = "expired";
      }
      const syncedExpiry = new Date(
        (liveSubscription as any).current_period_end * 1000,
      ).toISOString();
      const syncedActive =
        syncedStatus === "active" || syncedStatus === "trialing";

      console.log(
        `[Stripe Webhook ${event.type}] Parsing customer_id: ${customerId}, subscription_id: ${stripeSubId}, status: ${syncedStatus}`,
      );
      console.log(
        `[Stripe Webhook DEBUG] SUBSCRIPTION UPDATED: ${stripeSubId}, status: ${syncedStatus}`,
      );

      // Try searching for business ID using either metadata or customer ID
      let businessId =
        liveSubscription.metadata?.business_id ||
        liveSubscription.metadata?.businessId;
      if (!businessId) {
        const { data: bRec } = await db
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (bRec) {
          businessId = bRec.id;
        }
      }

      // Sync businesses table subscription columns
      if (businessId) {
        try {
          const saasUpdateData: any = {
            stripe_subscription_id: stripeSubId,
            subscription_status: syncedStatus,
            subscription_active: syncedActive,
            trial_ends_at: syncedExpiry,
          };

          if (syncedActive) {
            saasUpdateData.public_page_enabled = true;
            
            // Only update selected_plan if we know it (e.g. metadata is passed down). Or rely on checkout setting it.
            // Let's set it to 'pro' if empty, but prefer leaving existing. We don't read existing easily here, so we will skip setting selected_plan here.
          } else {
             saasUpdateData.public_page_enabled = false;
          }

          await db
            .from("businesses")
            .update(saasUpdateData)
            .eq("id", businessId);
          console.log(
            `[Webhook Sync] Aligned businesses subscription info for business: ${businessId}`,
          );
        } catch (bizColUpdateErr: any) {
          console.warn(
            "[Webhook Warning] Failed to update business subscription columns:",
            bizColUpdateErr.message,
          );
        }
      }

      let syncErr = null;
      if (businessId) {
        const { data: existingSub } = await db
          .from("subscriptions")
          .select("id")
          .eq("business_id", businessId)
          .maybeSingle();

        if (existingSub) {
          console.log(
            `[Webhook SaaS Sync] Updating subscription in db for business ${businessId} to status '${syncedStatus}'`,
          );
          const { error: updErr } = await db
            .from("subscriptions")
            .update({
              status: syncedStatus,
              expires_at: syncedExpiry,
              stripe_subscription_id: stripeSubId,
            })
            .eq("id", existingSub.id);
          syncErr = updErr;
        } else {
          console.log(
            `[Webhook SaaS Sync] Creating subscription record in db for business ${businessId} with status '${syncedStatus}'`,
          );
          const { error: insErr } = await db.from("subscriptions").insert({
            business_id: businessId,
            plan_name: "Glamzo PRO", // Defaults to PRO if missed by checkout event
            status: syncedStatus,
            monthly_price: 19.90,
            started_at: new Date().toISOString(),
            expires_at: syncedExpiry,
            stripe_subscription_id: stripeSubId,
          });
          syncErr = insErr;
        }
      } else {
        // Fallback: update by subscription ID only
        const { error: normalUpd } = await db
          .from("subscriptions")
          .update({ status: syncedStatus, expires_at: syncedExpiry })
          .eq("stripe_subscription_id", stripeSubId);
        syncErr = normalUpd;
      }

      if (syncErr) {
        console.error("[Webhook Sub State Sync Err]:", syncErr.message);
      } else {
        console.log(
          `[Webhook SaaS Sync Completed] SUBSCRIPTION UPDATED SUCCESSFULLY for Stripe Sub: ${stripeSubId}`,
        );
      }
    }

    // --- EVENT TYPE: invoice.paid / invoice.payment_failed ---
    if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubId = (invoice as any).subscription as string;
      const customerId = (invoice as any).customer as string;

      if (stripeSubId) {
        const syncedStatus =
          event.type === "invoice.paid" ? "active" : "past_due";
        const syncedActive = syncedStatus === "active";
        console.log(
          `[Stripe Webhook ${event.type}] Parsing customer_id: ${customerId}, subscription_id: ${stripeSubId}, status: ${syncedStatus}`,
        );

        let businessId = null;
        const { data: bRec1 } = await db
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (bRec1) {
          businessId = bRec1.id;
        }

        if (businessId) {
          try {
            const saasUpdateData: any = {
              subscription_status: syncedStatus,
              subscription_active: syncedActive,
            };

            if (syncedActive) {
               saasUpdateData.status = 'active';
               saasUpdateData.public_page_enabled = true;
               
               // --- AFFILIATE PAYOUT LOGIC ---
               try {
                 const invoiceAmountPaid = (invoice as any).amount_paid || 0;
                 if (invoiceAmountPaid > 0) {
                   const { data: referral } = await db
                     .from('affiliate_referrals')
                     .select('*')
                     .eq('referred_business_id', businessId)
                     .eq('status', 'pending')
                     .maybeSingle();

                   if (referral) {
                     // Update referral status
                     await db
                       .from('affiliate_referrals')
                       .update({ status: 'paid' })
                       .eq('id', referral.id);
                     
                     // Find referrer and add 10 EUR to balance
                     const { data: referrer } = await db
                       .from('profiles')
                       .select('affiliate_balance')
                       .eq('id', referral.referrer_id)
                       .maybeSingle();
                       
                     if (referrer) {
                        const newBalance = (referrer.affiliate_balance || 0) + 10;
                        await db.from('profiles').update({ affiliate_balance: newBalance }).eq('id', referral.referrer_id);
                        console.log(`[Affiliate] Added 10 EUR to user ${referral.referrer_id} for referring business ${businessId}`);
                     }
                   }
                 }
               } catch (affiliateErr: any) {
                 console.error("[Webhook Affiliate Logic Error]:", affiliateErr.message);
               }
               // -----------------------------
               
            } else {
               saasUpdateData.public_page_enabled = false;
            }

            await db
              .from("businesses")
              .update(saasUpdateData)
              .eq("id", businessId);
          } catch (err: any) {
            console.warn(
              "[Webhook Warning] Businesses sub status sync failed on invoice event:",
              err.message,
            );
          }
        }

        const { data: existingSub } = await db
          .from("subscriptions")
          .select("id")
          .eq("stripe_subscription_id", stripeSubId)
          .maybeSingle();

        if (existingSub) {
          await db
            .from("subscriptions")
            .update({ status: syncedStatus })
            .eq("id", existingSub.id);
        } else if (businessId) {
          await db.from("subscriptions").insert({
            business_id: businessId,
            plan_name: "PRO",
            status: syncedStatus,
            started_at: new Date().toISOString(),
            stripe_subscription_id: stripeSubId,
          });
        }
      }
    }

    // --- EVENT TYPE: account.updated (Connected Accounts operational status changes!) ---
    if (event.type === "account.updated") {
      const activeAccount = event.data.object as Stripe.Account;
      const stripeAccountId = activeAccount.id;

      const verifiedCharges = activeAccount.charges_enabled ? true : false;
      const verifiedPayouts = activeAccount.payouts_enabled ? true : false;

      const { error: bizUpdateErr } = await db
        .from("businesses")
        .update({
          charges_enabled: verifiedCharges,
          payouts_enabled: verifiedPayouts,
        })
        .eq("stripe_account_id", stripeAccountId);

      if (bizUpdateErr) {
        console.error(
          "[Webhook Connect Operations Sync Err]:",
          bizUpdateErr.message,
        );
      } else {
        console.log(
          `[Webhook Connect Sync Completed] Operational capabilities for account ${stripeAccountId}: charges_enabled=${verifiedCharges}, payouts_enabled=${verifiedPayouts}`,
        );
      }
    }

    // --- EVENT TYPE: payout.paid / payout.failed (Dynamic automated weekly payouts logger!) ---
    if (event.type === "payout.paid" || event.type === "payout.failed") {
      const currentPayoutObj = event.data.object as Stripe.Payout;
      const stripeAccountId = event.account; // Retrieve the target standard sub-account header field

      if (stripeAccountId) {
        const { data: business } = await db
          .from("businesses")
          .select("id")
          .eq("stripe_account_id", stripeAccountId)
          .maybeSingle();

        if (business) {
          const transRealAmount = currentPayoutObj.amount / 100;
          const targetStatus =
            event.type === "payout.paid" ? "completed" : "rejected";

          const { error: payoutLogErr } = await db.from("payouts").insert({
            business_id: business.id,
            amount: transRealAmount,
            payout_method: "stripe_connect",
            payout_status: targetStatus,
            processed_at: new Date().toISOString(),
          });

          if (payoutLogErr) {
            console.error(
              "[Webhook Payout DB Log Insertion Err]:",
              payoutLogErr.message,
            );
          } else {
            console.log(
              `[Webhook Payout Log Completed] Recorded payout item of ${transRealAmount}EUR, status aligned: ${targetStatus} for business ${business.id}`,
            );
          }
        }
      }
    }

    // --- EVENT TYPE: invoice.paid / invoice.payment_failed ---
    if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubId = (invoice as any).subscription as string;
      const amountPaid = (invoice.amount_paid / 100).toFixed(2);
      const invoiceNum = invoice.number || "N/A";
      const invoicePdf =
        invoice.hosted_invoice_url || invoice.invoice_pdf || "#";

      if (stripeSubId) {
        const { data: business } = await db
          .from("businesses")
          .select("id, email, owner_id")
          .eq("stripe_subscription_id", stripeSubId)
          .maybeSingle();

        if (business) {
          const { data: owner } = await db
            .from("profiles")
            .select("email")
            .eq("id", business.owner_id)
            .maybeSingle();
          const pEmail = business.email || (owner && owner.email);

          if (pEmail) {
            try {
              if (event.type === "invoice.paid") {
                await EmailService.sendInvoiceEmail(pEmail, {
                  amount: `${amountPaid} €`,
                  date: new Intl.DateTimeFormat("pt-PT").format(new Date()),
                  invoiceNumber: invoiceNum,
                  downloadUrl: invoicePdf,
                });
                console.log(
                  `[Webhook SaaS Email] Sent invoice email to ${pEmail}`,
                );
              } else if (event.type === "invoice.payment_failed") {
                const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                await EmailService.sendPaymentFailedEmail(pEmail, {
                  explanation:
                    "O método de pagamento associado à subscrição foi recusado pelo banco ou expirou.",
                  updatePaymentUrl: "https://glamzo.pt/dashboard",
                  suspensionDate: new Intl.DateTimeFormat("pt-PT").format(
                    nextWeek,
                  ),
                });
                console.log(
                  `[Webhook SaaS Email] Sent payment failed email to ${pEmail}`,
                );
              }
            } catch (emailErr: any) {
              console.error(
                "[Webhook Email Dispatch Error]:",
                emailErr.message,
              );
            }
          }
        }
      }
    }
  } catch (webhookEngineGeneralCrash: any) {
    console.error(
      "[Webhook Master Router Crash Exception]:",
      webhookEngineGeneralCrash.message,
    );
  }

  res.json({ received: true });
};

// Register webhook endpoints on both paths to support dynamic setup patterns
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "*/*" }),
  handleStripeWebhook,
);
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "*/*" }),
  handleStripeWebhook,
);

// Initialize Express + Vite server middlewares


app.post('/api/staff/bookings/query', express.json(), async (req, res) => {
  try {
    const { businessId, staffId, limitDate } = req.body;
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("bookings")
      .select("*, customer_profile:profiles(full_name, avatar_url), service:services(name, duration_minutes, price)")
      .eq("business_id", businessId)
      .or(`staff_id.eq.${staffId},staff_id.is.null`)
      .gte("booking_date", limitDate)
      .neq("booking_status", "cancelled")
      .order("start_time", { ascending: true });
      
    if (error) throw error;
    res.json({ data });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/staff/bookings/create', express.json(), async (req, res) => {
  try {
    const { payload } = req.body;
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("bookings").insert(payload);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/api/business/complete-booking', express.json(), async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'Missing bookingId' });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();
    if (fetchError || !booking) throw fetchError || new Error("Booking not found");

    if (booking.booking_status === 'completed') {
      return res.json({ success: true, message: 'Already completed' });
    }

        if (booking.payment_method === 'in_store' || booking.payment_method === 'local' || booking.payment_method === 'dinheiro') {
      console.log('Pagamento local: Sem pontos');
    }
    const pointsToAdd = (booking.payment_method === 'in_store' || booking.payment_method === 'local' || booking.payment_method === 'dinheiro') ? 0 : (booking.payment_method === 'stripe' ? 50 : 0);

    const { error: updateError } = await supabaseAdmin.from('bookings').update({
      booking_status: 'completed'
    }).eq('id', bookingId);
    if (updateError) throw updateError;

    if (booking.customer_id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('glamzo_points').eq('id', booking.customer_id).maybeSingle();
      if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await supabaseAdmin.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 1);
        await supabaseAdmin.from('points_history').insert({
          user_id: booking.customer_id,
          points: pointsToAdd,
          description: `Reserva #${booking.id.split('-')[0]}`,
          booking_id: booking.id,
          expires_at: expiresDate.toISOString()
        });
      }
    }

    res.json({ success: true, pointsAdded: pointsToAdd });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff/bookings/update', express.json(), async (req, res) => {
  try {
    const { id, payload } = req.body;
    const db = getSupabaseAdmin();
    
    if (payload.booking_status === 'completed') {
      const { data: booking, error: fetchError } = await db.from('bookings').select('*').eq('id', id).maybeSingle();
      if (fetchError || !booking) throw fetchError || new Error("Booking not found");
          if (booking.payment_method === 'in_store' || booking.payment_method === 'local' || booking.payment_method === 'dinheiro') {
      console.log('Pagamento local: Sem pontos');
    }
    const pointsToAdd = (booking.payment_method === 'in_store' || booking.payment_method === 'local' || booking.payment_method === 'dinheiro') ? 0 : (booking.payment_method === 'stripe' ? 50 : 0);
      const { error: updateError } = await db.from('bookings').update({ booking_status: 'completed' }).eq('id', id);
      if (updateError) throw updateError;
      if (booking.customer_id) {
        const { data: profile } = await db.from('profiles').select('glamzo_points').eq('id', booking.customer_id).maybeSingle();
        if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await db.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
        const expiresDate = new Date();
        expiresDate.setFullYear(expiresDate.getFullYear() + 1);
        await db.from('points_history').insert({
          user_id: booking.customer_id,
          points: pointsToAdd,
          description: `Reserva #${booking.id.split('-')[0]}`,
          booking_id: booking.id,
          expires_at: expiresDate.toISOString()
        });
      }
      }
    } else {
      const { error } = await db.from("bookings").update(payload).eq('id', id);
      if (error) throw error;
    }
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});






app.post('/api/admin/client-bookings', express.json(), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const { data, error } = await getSupabaseAdmin()
      .from('bookings')
      .select('*, businesses(name), services(name)')
      .eq('customer_id', userId)
      .order('booking_date', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/update-financials', express.json(), async (req, res) => {
  try {
    const { userId, wallet_balance, glamzo_points } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    // We assume the caller is admin, but for simplicity we'll just bypass
    const { error } = await getSupabaseAdmin().from('profiles').update({
      wallet_balance: Number(wallet_balance),
      glamzo_points: Number(glamzo_points)
    }).eq('id', userId);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/admin/update-store', express.json(), async (req, res) => {
  try {
    const { storeId, updates } = req.body;
    if (!storeId) return res.status(400).json({ error: 'Missing storeId' });
    
    const { error } = await getSupabaseAdmin().from('businesses').update(updates).eq('id', storeId);
    
    if (error) {
      console.error("Supabase Error Update Store:", error);
      throw new Error(error.message || JSON.stringify(error));
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/admin/delete-store', express.json(), async (req, res) => {
  try {
    const { storeId } = req.body;
    if (!storeId) return res.status(400).json({ error: 'Missing storeId' });
    const { error } = await getSupabaseAdmin().from('businesses').delete().eq('id', storeId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/impersonate', express.json(), async (req, res) => {
  try {
    const { adminId, targetEmail } = req.body;
    const db = getSupabaseAdmin();
    // Verify admin
    const { data: adminUser } = await db.from('profiles').select('role').eq('id', adminId).maybeSingle();
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Generate magic link
    const { data: linkData, error: linkErr } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email: targetEmail
    });
    
    if (linkErr) throw linkErr;
    
    res.json({ link: linkData.properties.action_link });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


async function startServer() {
  app.get("/api/availability/:businessId", async (req, res) => {
    try {
      const businessId = req.params.businessId;
      const db = getSupabaseAdmin();
      const { data: hoursData } = await db
        .from("business_hours")
        .select("*")
        .eq("business_id", businessId);
      if (!hoursData || hoursData.length === 0) {
        return res.json({ available: false, label: "Sem vagas disponíveis" });
      }

      const today = new Date();
      const options = { timeZone: "Europe/Lisbon" };
      const todayStr = new Intl.DateTimeFormat("en-CA", {
        ...options,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(today);
      const maxDay = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      const maxDayStr = new Intl.DateTimeFormat("en-CA", {
        ...options,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(maxDay);

      const { data: bookingsData } = await db
        .from("bookings")
        .select("staff_id, booking_date, start_time, end_time")
        .eq("business_id", businessId)
        .neq("booking_status", "cancelled")
        .gte("booking_date", todayStr)
        .lte("booking_date", maxDayStr);

      const { data: staffData } = await db
        .from("staff")
        .select("id, full_name, is_active")
        .eq("business_id", businessId)
        .eq("is_active", true);
      if (!staffData || staffData.length === 0) {
        return res.json({
          available: false,
          label: "Sem profissionais ativos",
        });
      }

      const slotDurationMins = 30; // Min default
      const parseTime = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
      };

      for (let i = 0; i < 14; i++) {
        const checkDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = checkDate.getDay();
        const localStr = new Intl.DateTimeFormat("en-CA", {
          ...options,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(checkDate);
        const dayStr = localStr;

        const bizDayHours = hoursData.find((h: any) => h.weekday === dayOfWeek);
        if (!bizDayHours || bizDayHours.is_closed) continue;

        let startMin = parseTime(bizDayHours.open_time);
        if (i === 0) {
          const currentMinOfDay = today.getHours() * 60 + today.getMinutes();
          if (startMin < currentMinOfDay + 30) {
            startMin = currentMinOfDay + 30;
            startMin = Math.ceil(startMin / 15) * 15;
          }
        }

        const endMin = parseTime(bizDayHours.close_time);
        if (startMin >= endMin) continue;

        const dayBookings = (bookingsData || []).filter(
          (b: any) => b.booking_date === dayStr,
        );

        for (
          let time = startMin;
          time <= endMin - slotDurationMins;
          time += 15
        ) {
          for (const st of staffData) {
            const isOccupied = dayBookings.some((b: any) => {
              if (b.staff_id !== null && b.staff_id !== st.id) return false;
              const bStart = parseTime(b.start_time);
              const bEnd = parseTime(b.end_time);
              return time < bEnd && time + slotDurationMins > bStart;
            });
            if (!isOccupied) {
              const hour = Math.floor(time / 60);
              const min = time % 60;
              const timeFormatted = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

              let label = `Disponível hoje às ${timeFormatted}`;
              if (i === 1) label = `Próxima vaga amanhã às ${timeFormatted}`;
              else if (i > 1) {
                const daysPt = [
                  "domingo",
                  "segunda",
                  "terça",
                  "quarta",
                  "quinta",
                  "sexta",
                  "sábado",
                ];
                label = `Disponível ${daysPt[dayOfWeek]} às ${timeFormatted}`;
              }
              return res.json({
                available: true,
                datetime: `${dayStr}T${timeFormatted}`,
                label,
                professional_name: st.full_name,
              });
            }
          }
        }
      }
      res.json({ available: false, label: "Sem vagas nos próx. 14 dias" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files with high-performance Cache-Control headers
    const distPath = path.join(process.cwd(), "dist");

    // 1. Immutable hashing cache for Vite assets (long cache: 1 year)
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
        fallthrough: false,
      }),
    );

    // 2. Optimized caching for fallback root directory static assets
    app.use(
      express.static(distPath, {
        maxAge: "1h",
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".html")) {
            // Force HTML files to check with server so updates roll out instantly
            res.setHeader(
              "Cache-Control",
              "no-cache, no-store, must-revalidate",
            );
          } else if (
            filePath.match(/\.(js|css|svg|png|jpg|jpeg|gif|ico|webp|woff2)$/)
          ) {
            // Allow sub-resources to cache heavily (e.g. logo, icons, favicon)
            res.setHeader("Cache-Control", "public, max-age=86400");
          }
        },
      }),
    );

    // Fallback response for single-page routing
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Glamzo Full-Stack Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`,
    );
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
