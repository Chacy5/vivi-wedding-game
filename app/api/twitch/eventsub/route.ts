import { acceptTwitchChatCommand, verifyTwitchSignature } from "@/lib/twitch";

type EventSubBody = { challenge?: string; subscription?: { type?: string }; event?: { chatter_user_id?: string; chatter_user_login?: string; message?: { text?: string } } };

export async function POST(request: Request) {
  const raw = await request.text();
  const messageId = request.headers.get("twitch-eventsub-message-id") || "";
  const timestamp = request.headers.get("twitch-eventsub-message-timestamp") || "";
  const signature = request.headers.get("twitch-eventsub-message-signature");
  if (!verifyTwitchSignature(raw, messageId, timestamp, signature)) return new Response("invalid signature", { status: 403 });
  const body = JSON.parse(raw) as EventSubBody;
  const type = request.headers.get("twitch-eventsub-message-type");
  if (type === "webhook_callback_verification") return new Response(body.challenge || "", { headers: { "content-type": "text/plain" } });
  if (type === "notification" && body.subscription?.type === "channel.chat.message" && body.event) await acceptTwitchChatCommand(process.env.GAME_ROOM || "VIVI-HINA", body.event);
  return new Response("ok");
}
