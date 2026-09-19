import { randomBytes } from "node:crypto";

export async function GET(request: Request) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const setupKey = process.env.TWITCH_SETUP_KEY;
  const requestedKey = new URL(request.url).searchParams.get("key");
  if (!clientId || !setupKey || requestedKey !== setupKey) return new Response("Twitch не настроен или неверная ссылка подключения.", { status: 403 });
  const state = randomBytes(24).toString("hex");
  const redirectUri = process.env.TWITCH_REDIRECT_URI || new URL("/api/twitch/callback", request.url).toString();
  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "user:read:chat user:bot channel:bot");
  url.searchParams.set("state", state);
  const response = Response.redirect(url);
  response.headers.set("Set-Cookie", `vivi_twitch_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`);
  return response;
}
