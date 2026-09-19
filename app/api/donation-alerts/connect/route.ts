import { config } from "@/lib/donation-alerts";

export async function GET() {
  const clientId = process.env.DONATIONALERTS_CLIENT_ID;
  const redirectUri = process.env.DONATIONALERTS_REDIRECT_URI || "http://localhost:5173/api/donation-alerts/callback";
  if (!clientId || !process.env.DONATIONALERTS_CLIENT_SECRET) return Response.json({ error: "Добавь DONATIONALERTS_CLIENT_ID и DONATIONALERTS_CLIENT_SECRET в .env.local." }, { status: 400 });
  const url = new URL("https://www.donationalerts.com/oauth/authorize");
  url.searchParams.set("client_id", clientId); url.searchParams.set("redirect_uri", redirectUri); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "oauth-user-show oauth-donation-index oauth-donation-subscribe");
  return Response.redirect(url);
}
