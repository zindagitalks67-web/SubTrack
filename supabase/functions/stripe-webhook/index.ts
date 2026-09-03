import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
if (!supabaseUrl) throw new Error("SUPABASE_URL is not configured");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey
);

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const body = await req.text();

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log(`Stripe event received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan ?? "monthly"; // ✅ Plan metadata se aayega

      console.log("Checkout completed:", { sessionId: session.id, userId, plan, paymentStatus: session.payment_status });

      if (!userId) {
        throw new Error("user_id missing from Stripe checkout session metadata");
      }

      // 🔥 STEP 1: `profiles` table mein plan update karo
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({
          tier: "premium",
          plan: plan,
        })
        .eq("id", userId)
        .select();

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      console.log("Profile updated:", profileData);

      // 🔥 STEP 2: `auth.users` metadata mein bhi plan update karo (Frontend isi se padhta hai)
      const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          tier: "premium",
          plan: plan,
        },
      });

      if (authError) {
        console.error("Auth metadata update error:", authError.message);
      } else {
        console.log("Auth metadata updated:", authData.user?.id);
      }

      console.log(`PREMIUM ACTIVATED: ${userId} | PLAN: ${plan}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});