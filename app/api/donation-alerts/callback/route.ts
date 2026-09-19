import { setAccessToken } from "@/lib/donation-alerts";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const clientId = process.env.DONATIONALERTS_CLIENT_ID;
  const clientSecret = process.env.DONATIONALERTS_CLIENT_SECRET;
  const redirectUri = process.env.DONATIONALERTS_REDIRECT_URI || "http://localhost:5173/api/donation-alerts/callback";
  if (!code || !clientId || !clientSecret) return new Response("DonationAlerts не подключён: проверь код авторизации и .env.local.", { status: 400 });
  const form = new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, code });
  const response = await fetch("https://www.donationalerts.com/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  if (!response.ok) return new Response("DonationAlerts не принял авторизацию. Проверь Redirect URI в настройках приложения.", { status: 401 });
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) return new Response("DonationAlerts не вернул токен.", { status: 401 });
  await setAccessToken(data.access_token);
  return Response.redirect(new URL("/donations?connected=1", request.url));
}
