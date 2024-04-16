"use client";

import { useRouter } from 'next/navigation'
import React from "react";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter()

  async function goToStripeCheckout(uid: string) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          successUrl: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/success/${uid}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/cancel/${uid}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Error fetching checkout page");
      }

      const data = await response.json();

      console.log(data);

      router.push(data.url);
    } catch (error) {
      console.error("Error calling the 'create-checkout' endpoint:", error);
      return false;
    }
  }

  // Fake an ID for the product
  const uid = "opel-corsa-8295";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Buy with <span className="text-[hsl(280,100%,70%)]">Stripe</span> and{" "}
          <span className="text-[hsl(280,100%,70%)]">Next.js</span>
        </h1>

        <p className="text-center text-2xl text-white">
          Click the button below to buy the Opel Corsa with UID{" "}
          <code>{uid}</code>
        </p>

        <Button
          variant="outline"
          onClick={() => {
            goToStripeCheckout(uid);
          }}
          disabled={isLoading}
        >
          Buy Opel Corsa
        </Button>
      </div>
    </main>
  );
}
