import { saveTwitchCredentials } from "@/lib/twitch";

type TokenResponse = { access_token?: string };
type UserResponse = { data?: Array<{ id: string; login: string }> };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const expectedState = request.headers.get("cookie")?.match(/(?:^|; )vivi_twitch_state=([^;]+)/)?.[1];
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const code = url.searchParams.get("code");
  const redirectUri = process.env.TWITCH_REDIRECT_URI || new URL("/api/twitch/callback", request.url).toString();
  if (!code || !clientId || !clientSecret || !expectedState || expectedState !== url.searchParams.get("state")) return new Response("Twitch не подтвердил подключение. Открой ссылку подключения ещё раз.", { status: 400 });
  const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: redirectUri }) });
  const token = await tokenResponse.json() as TokenResponse;
  if (!tokenResponse.ok || !token.access_token) return new Response("Twitch не выдал токен. Проверь Redirect URL в приложении Twitch.", { status: 401 });
  const userResponse = await fetch("https://api.twitch.tv/helix/users", { headers: { Authorization: `Bearer ${token.access_token}`, "Client-Id": clientId } });
  const user = await userResponse.json() as UserResponse;
  const broadcaster = user.data?.[0];
  if (!broadcaster) return new Response("Не удалось узнать канал Twitch.", { status: 401 });
  await saveTwitchCredentials({ accessToken: token.access_token, broadcasterId: broadcaster.id, broadcasterLogin: broadcaster.login });
  const callback = new URL("/api/twitch/eventsub", request.url).toString();
  const subscription = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", { method: "POST", headers: { Authorization: `Bearer ${token.access_token}`, "Client-Id": clientId, "content-type": "application/json" }, body: JSON.stringify({ type: "channel.chat.message", version: "1", condition: { broadcaster_user_id: broadcaster.id, user_id: broadcaster.id }, transport: { method: "webhook", callback, secret: process.env.TWITCH_EVENTSUB_SECRET } }) });
  if (!subscription.ok) return new Response("Twitch подключён, но не смог включить чтение чата. Проверь TWITCH_EVENTSUB_SECRET и URL сайта.", { status: 502 });
  const response = Response.redirect(new URL("/?twitch=connected", request.url));
  response.headers.set("Set-Cookie", "vivi_twitch_state=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0");
  return response;
}
