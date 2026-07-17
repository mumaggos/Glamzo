const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const {
      bookingId,
      amount,
      stripeAccountId,
      customerEmail,
      serviceName,
      businessName,
      successUrl,
      cancelUrl,
    } = req.body;

    if (!bookingId || !amount) {
      res
        .status(400)
        .json({
          error: "Falta o parâmetro bookingId ou o valor total do agendamento",
        });
      return;
    }

    const db = getSupabaseAdmin();
    const stripe = getStripe();
    const amountCents = Math.round(Number(amount) * 100);

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
      const { data: bookingRec } = await db
        .from("bookings")
        .select("business_id")
        .eq("id", bookingId)
        .maybeSingle();

      if (bookingRec?.business_id) {
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
    }`;

const replaceStr = `app.post("/api/create-checkout-session", async (req, res) => {
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
    } = req.body;

    if (!bookingId) {
      res
        .status(400)
        .json({
          error: "Falta o parâmetro bookingId",
        });
      return;
    }

    const db = getSupabaseAdmin();
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
    }`;

if (content.includes(targetStr)) {
  fs.writeFileSync('server.ts', content.replace(targetStr, replaceStr));
  console.log("Replaced successfully!");
} else {
  console.log("Target string not found!");
}
