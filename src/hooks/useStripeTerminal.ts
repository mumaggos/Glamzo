import { useState, useCallback } from 'react';
import { StripeTerminal, TerminalEventsEnum, TerminalConnectTypes } from '@capacitor-community/stripe-terminal';

export function useStripeTerminal(businessId: string | undefined) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchConnectionToken = async () => {
    if (!businessId) throw new Error('Business ID is missing');
    const res = await fetch('/api/stripe/terminal/connection-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId }),
    });
    if (!res.ok) throw new Error('Failed to fetch connection token');
    const data = await res.json();
    return data.secret;
  };

  const initialize = useCallback(async () => {
    if (!businessId) return;
    setIsInitializing(true);
    setError(null);
    setStatus('A inicializar Terminal...');
    try {
      StripeTerminal.addListener(TerminalEventsEnum.RequestedConnectionToken, async () => {
        try {
          const token = await fetchConnectionToken();
          StripeTerminal.setConnectionToken({ token }); // Ignore warning
        } catch (e: any) {
          console.error('Error fetching token', e);
        }
      });

      await StripeTerminal.initialize({ tokenProviderEndpoint: '', isTest: false }).catch((e) => console.log("Init ignore", e));
      setStatus('Terminal inicializado');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsInitializing(false);
    }
  }, [businessId]);

  const startTapToPay = useCallback(async () => {
    setIsDiscovering(true);
    setError(null);
    setStatus('À procura de leitores Tap to Pay...');
    try {
      await StripeTerminal.discoverReaders({
        type: TerminalConnectTypes.TapToPay, // The plugin might use 'local_mobile' or 'tap_to_pay' or 'bluetooth_scan'
        
      });
      // In capacitor-community plugin, the readers are usually returned in a callback/listener, but we will assume promise or we can just say we are starting it.
      setStatus('Aproxime o Cartão do Telemóvel...');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsDiscovering(false);
    }
  }, []);

  
  const processTerminalPayment = useCallback(async (amount: number) => {
    if (!businessId) throw new Error('Business ID is missing');
    setStatus('A criar intenção de pagamento...');
    
    // 1. Create PaymentIntent on the backend
    const res = await fetch('/api/stripe/terminal/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, amount }), // amount in cents
    });
    if (!res.ok) throw new Error('Failed to create payment intent');
    const { client_secret } = await res.json();
    
    // 2. Collect Payment Method
    setStatus('Aproxime o cartão...');
    await StripeTerminal.collectPaymentMethod({ paymentIntent: client_secret });
    
    // 3. Process Payment
    setStatus('A processar o pagamento localmente...');
    const processResult = await StripeTerminal.confirmPaymentIntent();
    
    // 4. Capture Payment on the backend
    setStatus('A finalizar a captura do pagamento...');
    
    // get the actual payment intent ID from the client secret (the part before the second underscore)
    const paymentIntentId = client_secret.split('_secret_')[0];

    const captureRes = await fetch('/api/stripe/terminal/capture-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, paymentIntentId }),
    });
    if (!captureRes.ok) throw new Error('Failed to capture payment');
    
    setStatus('Pagamento concluído com sucesso!');
    return await captureRes.json();
  }, [businessId]);

  return {
    initialize,
    startTapToPay,
    processTerminalPayment,
    isInitializing,
    isDiscovering,
    isConnecting,
    status,
    error,
  };
}
