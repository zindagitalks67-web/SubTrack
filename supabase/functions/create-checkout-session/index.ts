import Stripe from "npm:stripe@14.25.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

// ✅ Sirf ye emails plan le paayenge
const ALLOWED_EMAILS = [
  "application.hub143@gmail.com",
  "applicationhub123@gmail.com",
  "scraphunter874@gmail.com",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, email, plan } = await req.json();

    // 🔒 Email check karo
    if (!ALLOWED_EMAILS.includes(email)) {
      return new Response(
        JSON.stringify({ error: "Access restricted. Please contact admin to get access." }),
        { status: 403, headers: corsHeaders }
      );
    }

    // ✅ Error Fix: 'any' hata kar specific type use kiya
    const prices: Record<string, string> = {
      monthly: "price_1U943aG07vRIW90LPym4sLyZ",
      yearly: "price_1U9jaiG07vRIW90LXGME3WRm",
      lifetime: "price_1UADmwG07vRIW90L6q4lWEQq",
    };

    const selectedPrice = prices[plan] || prices.monthly;
    const mode = plan === "lifetime" ? "payment" : "subscription";

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items: [{ price: selectedPrice, quantity: 1 }],
      success_url: `${req.headers.get("origin")}/settings?success=true`,
      cancel_url: `${req.headers.get("origin")}/settings?canceled=true`,
      client_reference_id: user_id,
      customer_email: email,
      metadata: { user_id, plan }
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: corsHeaders });
  } catch (error) { // ✅ Error Fix: ': any' hata diya
    console.error("Stripe session error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: corsHeaders });
  }
});