import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
const IS_PRODUCTION = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";

const MIDTRANS_API_URL = IS_PRODUCTION
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MidtransRequest {
    order_id: string;
    gross_amount: number;
    customer_details: any;
    item_details: any[];
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!MIDTRANS_SERVER_KEY) {
            throw new Error("MIDTRANS_SERVER_KEY is not set in Supabase Secrets");
        }

        const { order_id, gross_amount, customer_details, item_details } = await req.json() as MidtransRequest;

        if (!order_id || !gross_amount) {
            return new Response(
                JSON.stringify({ error: "Missing required fields (order_id or gross_amount)" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const authHeader = `Basic ${btoa(MIDTRANS_SERVER_KEY + ":")}`;

        console.log(`Creating Midtrans Transaction: ${order_id} for $${gross_amount}`);

        const response = await fetch(MIDTRANS_API_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": authHeader,
            },
            body: JSON.stringify({
                transaction_details: {
                    order_id,
                    gross_amount,
                    currency: "USD",
                },
                item_details,
                customer_details,
                enabled_payments: [
                    "credit_card",
                    "cimb_clicks",
                    "bca_klikbca",
                    "bca_klikpay",
                    "bri_epay",
                    "echannel",
                    "permata_va",
                    "bca_va",
                    "bni_va",
                    "bri_va",
                    "other_va",
                    "gopay",
                    "indomaret",
                    "alfamart",
                    "shopeepay",
                    "qris"
                ],
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`Midtrans API Error (${response.status}):`, result);
        }

        return new Response(
            JSON.stringify(result),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Edge Function Error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
