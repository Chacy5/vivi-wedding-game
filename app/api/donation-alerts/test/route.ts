import { createTestDonation } from "@/lib/donation-alerts";

export async function POST(request: Request) {
  const { amount, username, message } = await request.json() as { amount?: number | string; username?: string; message?: string };
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed < 1) return Response.json({ error: "Укажи сумму больше нуля." }, { status: 400 });
  return Response.json({ event: await createTestDonation({ amount: parsed, username, message }) });
}
