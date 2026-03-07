declare global {
    interface Window {
        snap: {
            pay: (
                token: string,
                callbacks: {
                    onSuccess?: (result: MidtransResult) => void;
                    onPending?: (result: MidtransResult) => void;
                    onError?: (result: MidtransResult) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}

export interface MidtransResult {
    order_id: string;
    transaction_status: string;
    fraud_status: string;
    status_code: string;
    status_message: string;
    gross_amount: string;
    payment_type: string;
}

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

const SNAP_URL = IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

let snapLoaded = false;

export function loadSnapJs(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (snapLoaded && window.snap) {
            resolve();
            return;
        }

        // Check if script already exists
        const existing = document.querySelector(`script[src="${SNAP_URL}"]`);
        if (existing) {
            snapLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = SNAP_URL;
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.onload = () => {
            snapLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Midtrans Snap.js'));
        document.head.appendChild(script);
    });
}

/**
 * Generate a real Snap token by calling our Supabase Edge Function.
 */
export async function createMidtransTransaction(orderId: string, grossAmount: number, customerDetails?: any): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
                order_id: orderId,
                gross_amount: grossAmount,
                customer_details: customerDetails
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`Edge Function Error (${response.status}):`, body);
            throw new Error(`Edge Function Error: ${response.status} ${body}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (!data.token) {
            console.error('Midtrans Response:', data);
            throw new Error('Failed to get snap token: ' + JSON.stringify(data));
        }

        return data.token;
    } catch (error) {
        console.error('Midtrans Transaction Exception:', error);
        // Fallback to demo mode if function isn't deployed yet (for development only)
        if (import.meta.env.DEV) {
            console.warn('Falling back to mock token for development');
            return `DEMO-${orderId}-${Date.now()}`;
        }
        throw error;
    }
}

export function payWithSnap(
    token: string,
    callbacks: {
        onSuccess?: (result: MidtransResult) => void;
        onPending?: (result: MidtransResult) => void;
        onError?: (result: MidtransResult) => void;
        onClose?: () => void;
    }
): void {
    if (!window.snap) {
        console.error('Midtrans Snap.js not loaded');
        return;
    }
    window.snap.pay(token, callbacks);
}
