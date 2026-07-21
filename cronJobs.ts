import cron from "node-cron";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-01-27.acacia" as any,
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export function setupCronJobs() {
  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log("[CRON] Starting midnight routine...");
    try {
      await autoCompleteBookings();
      await auditSubscriptions();
      console.log("[CRON] Midnight routine completed successfully.");
    } catch (error) {
      console.error("[CRON] Error running midnight routine:", error);
    }
  });

  // Start the SMS Queue Processor loop
  processSmsQueue();
}

async function processSmsQueue() {
  const token = process.env.TRACCAR_SMS_TOKEN || "db04_CflQoC5MZ0-9tVkrS:APA91bFORleaNKqyNwH00La9RGA9WzUts8ctwiUNNq9GY3rjRABbhGbN2SPdQYUJ8dWBeXtfSBeg8oSNiHLslXi6amgw9LLZb8KrVnZT-JhU5T75_DMjwYo";

  try {
    // Fetch the first pending SMS
    const { data: messages, error: fetchError } = await supabaseAdmin
      .from('sms_queue')
      .select('*')
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) {
      console.error("[SMS Worker] Error fetching queue:", fetchError);
    } else if (messages && messages.length > 0) {
      const msg = messages[0];
      console.log(`[SMS Worker] Processing SMS ${msg.id} to ${msg.phone_number}`);

      // Update status to processando
      await supabaseAdmin.from('sms_queue').update({ status: 'processando' }).eq('id', msg.id);

      try {
        // Call Traccar API
        const response = await fetch("https://www.traccar.org/sms/", {
          method: "POST",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ to: msg.phone_number, message: msg.message })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        // Update status to enviado
        await supabaseAdmin.from('sms_queue').update({ status: 'enviado' }).eq('id', msg.id);
        console.log(`[SMS Worker] Sent SMS ${msg.id} successfully.`);
      } catch (sendError: any) {
        console.error(`[SMS Worker] Error sending SMS ${msg.id}:`, sendError.message);
        // Mark as erro
        await supabaseAdmin.from('sms_queue').update({ status: 'erro' }).eq('id', msg.id);
      }

      // Delay 4 seconds explicitly as requested before next loop
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  } catch (err) {
    console.error("[SMS Worker] Unhandled exception:", err);
  } finally {
    // If we processed a message, wait 4s was already done, but if queue is empty, wait 5s to check again
    setTimeout(processSmsQueue, 5000);
  }
}

async function autoCompleteBookings() {
  console.log("[CRON] Running auto-complete bookings task...");
  try {
    const today = new Date();
    // Get yesterday's date string YYYY-MM-DD
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // We fetch bookings where booking_date <= yesterday and status is pending or confirmed
    const { data: bookings, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('id, booking_status')
      .lte('booking_date', yesterdayStr)
      .in('booking_status', ['pending', 'confirmed']);

    if (fetchError) {
      console.error("[CRON] Error fetching bookings to complete:", fetchError);
      return;
    }

    if (!bookings || bookings.length === 0) {
      console.log("[CRON] No bookings to auto-complete.");
      return;
    }

    console.log(`[CRON] Found ${bookings.length} bookings to complete.`);

    // Perform the update
    const bookingIds = bookings.map(b => b.id);
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ booking_status: 'completed' })
      .in('id', bookingIds);

    if (updateError) {
      console.error("[CRON] Error updating bookings:", updateError);
    } else {
      console.log(`[CRON] Successfully completed ${bookings.length} past bookings.`);
    }
  } catch (err) {
    console.error("[CRON] Exception in auto-complete bookings:", err);
  }
}

async function auditSubscriptions() {
  console.log("[CRON] Running subscription audit task...");
  try {
    // Find active businesses with a Stripe subscription ID
    const { data: businesses, error: fetchError } = await supabaseAdmin
      .from('businesses')
      .select('id, stripe_subscription_id, subscription_active, subscription_status, trial_ends_at')
      .not('stripe_subscription_id', 'is', null);

    if (fetchError) {
      console.error("[CRON] Error fetching businesses for audit:", fetchError);
      return;
    }

    if (!businesses || businesses.length === 0) {
      console.log("[CRON] No businesses to audit.");
      return;
    }

    console.log(`[CRON] Auditing ${businesses.length} subscriptions...`);

    let updatedCount = 0;

    for (const business of businesses) {
      if (!business.stripe_subscription_id) continue;

      try {
        const subscription = await stripe.subscriptions.retrieve(business.stripe_subscription_id);
        
        let isActive = subscription.status === 'active' || subscription.status === 'trialing';
        
        // If they were active in DB but inactive in Stripe, update DB
        if ((business.subscription_active !== isActive) || (business.subscription_status !== subscription.status)) {
          const { error: updateError } = await supabaseAdmin
            .from('businesses')
            .update({
              subscription_active: isActive,
              subscription_status: subscription.status,
              trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : business.trial_ends_at
            })
            .eq('id', business.id);
            
          if (updateError) {
            console.error(`[CRON] Failed to update business ${business.id}:`, updateError);
          } else {
            console.log(`[CRON] Corrected subscription status for business ${business.id}: active=${isActive}, status=${subscription.status}`);
            updatedCount++;
          }
        }
      } catch (stripeErr: any) {
        console.error(`[CRON] Error retrieving subscription for business ${business.id}:`, stripeErr.message);
        
        // If the subscription does not exist on Stripe anymore
        if (stripeErr.code === 'resource_missing') {
          await supabaseAdmin
            .from('businesses')
            .update({
              subscription_active: false,
              subscription_status: 'canceled',
              stripe_subscription_id: null
            })
            .eq('id', business.id);
          updatedCount++;
          console.log(`[CRON] Subscription missing for business ${business.id}, marked as canceled.`);
        }
      }
    }

    console.log(`[CRON] Subscription audit finished. Updated ${updatedCount} businesses.`);
  } catch (err) {
    console.error("[CRON] Exception in subscription audit:", err);
  }
}
