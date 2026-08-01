import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co/';
let envAnon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
if (envAnon && envAnon.length < 50) envAnon = undefined;
const supabaseAnonKey = envAnon || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
// Push Notifications Setup (Web Push)
export async function registerPushNotifications(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push messaging is not supported');
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permission not granted for Notification');
      return;
    }
    
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // For a real production app you would use VAPID keys
      // const response = await fetch('/api/vapidPublicKey');
      // const vapidPublicKey = await response.text();
      // const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      // subscription = await registration.pushManager.subscribe({
      //  userVisibleOnly: true,
      //  applicationServerKey: convertedVapidKey
      // });
      console.log('Ready to subscribe with VAPID key in production');
    }
    
    if (subscription) {
       // Save to DB
       await supabase.from('push_subscriptions').upsert({
         user_id: userId,
         subscription: JSON.stringify(subscription),
         updated_at: new Date().toISOString()
       });
    }
  } catch (error) {
    console.error('Error registering push notifications:', error);
  }
}
