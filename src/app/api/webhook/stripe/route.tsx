import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY : "",
  {
    apiVersion: "2024-04-10",
    typescript: true,
  },
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  // Get the body
  const body = await req.text();

  // Get the stripe-signature from the headers
  const signature = headers().get("stripe-signature") ?? "";

  let eventType;
  let event;

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    const error = err as Error;
    console.error(
      `🖋️❌ Webhook signature verification failed. ${error.message}`,
    );
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  eventType = event.type;

  // Log the event type
  console.log(`🔔 Stripe Webhook Event - CAZADO!!: ${event.type}`);

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        console.log(
          `✅ Stripe Webhook Event - Checkout Session Completed: ${event.id}`,
        );
        break;
      }
    }
  } catch (err) {
    const error = err as Error;
    console.error("Error in Stripe Webhook:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, eventType })
}
