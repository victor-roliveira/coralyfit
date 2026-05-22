import { CheckoutClient } from "@/features/checkout/checkout-client";

export default function CheckoutPage() {
  return (
    <main className="container min-h-[calc(100vh-4rem)] py-10">
      <CheckoutClient />
    </main>
  );
}
