import "server-only";

const ABACATEPAY_BASE_URL = "https://api.abacatepay.com/v2";

type CreateCheckoutItem = {
  id: string;
  quantity: number;
};

type CreateCheckoutInput = {
  items: CreateCheckoutItem[];
  externalId: string;
  returnUrl: string;
  completionUrl: string;
};

type CreateCheckoutResponse = {
  success: boolean;
  error: string | null;
  data: {
    id: string;
    externalId: string | null;
    url: string;
    amount: number;
    status: string;
  } | null;
};

export async function createAbacatePayCheckout(input: CreateCheckoutInput) {
  const apiKey = process.env.ABACATEPAY_API_KEY;

  if (!apiKey) {
    throw new Error("ABACATEPAY_API_KEY is missing.");
  }

  const response = await fetch(`${ABACATEPAY_BASE_URL}/checkouts/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: input.items,
      externalId: input.externalId,
      returnUrl: input.returnUrl,
      completionUrl: input.completionUrl,
      methods: ["PIX", "CARD"],
      metadata: {
        source: "coraly-fit-web"
      }
    })
  });

  const payload = (await response.json()) as CreateCheckoutResponse;

  if (!response.ok || !payload.success || !payload.data?.url) {
    throw new Error(payload.error ?? "Unable to create AbacatePay checkout.");
  }

  return payload.data;
}
