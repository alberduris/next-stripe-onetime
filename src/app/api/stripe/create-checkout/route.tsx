import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-04-10",
  typescript: true,
});

// This function is used to create a Stripe Checkout Session (one-time payment)
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Check if the UID is present
  if (!body.uid) {
    return NextResponse.json({ error: "Missing UID", status: 400 });
  }

  // Check if the body has the required fields
  if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json({
      error: "Missing success or cancel URL",
      status: 400,
    });
  }

  try {
    const checkoutUrl = await createStripeCheckout(
      body.uid,
      body.successUrl,
      body.cancelUrl,
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const e = error as Error;
    console.error(
      "Error at 'create-checkout' when creating the Stripe Checkout:",
      error,
    );
    return NextResponse.json({ error: e.message, status: 500 });
  }
}

async function createStripeCheckout(uid: any, successUrl: any, cancelUrl: any) {
  const checkoutParams = {
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID ?? "",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      uid,
    },
    allow_promotion_codes: true,
  } as Stripe.Checkout.SessionCreateParams;

  const session = await stripe.checkout.sessions.create(checkoutParams);

  console.log(`🏧 Se ha creado un Checkout de Stripe para el Cuento ${uid} - Session: ${session.id}`);

  return session.url;
}
