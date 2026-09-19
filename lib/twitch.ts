import { createHmac, timingSafeEqual } from "node:crypto";
import { readPersistent, writePersistent } from "@/lib/persistence";
import { getRoom, saveRoom } from "@/lib/room-store";

type TwitchCredentials = { accessToken: string; broadcasterId: string; broadcasterLogin: string };
type ChatEvent = { chatter_user_id?: string; chatter_user_login?: string; message?: { text?: string } };
type ChatOption = { id?: string; label?: string };

const modeWithVotes = new Set(["this", "compatibility", "flags", "would", "court"]);

export async function getTwitchCredentials() {
  return readPersistent<TwitchCredentials | null>("settings:twitch", null);
}

export async function saveTwitchCredentials(value: TwitchCredentials) {
  await writePersistent("settings:twitch", value);
}

export function verifyTwitchSignature(rawBody: string, messageId: string, timestamp: string, signature: string | null) {
  const secret = process.env.TWITCH_EVENTSUB_SECRET;
  if (!secret || !signature || !messageId || !timestamp) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(messageId + timestamp + rawBody).digest("hex")}`;
  const received = Buffer.from(signature);
  const calculated = Buffer.from(expected);
  return received.length === calculated.length && timingSafeEqual(received, calculated);
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
}

function choiceFromCommand(text: string, options: ChatOption[]) {
  const direct = normalized(text).match(/^!голос\s+([1-4])$/);
  if (direct) return options[Number(direct[1]) - 1]?.id;
  const aliases: Record<string, string[]> = {
    "!виви": ["виви"], "!хина": ["хина", "хиноч"], "!оба": ["оба", "обе"], "!никто": ["никто"],
  };
  for (const [command, words] of Object.entries(aliases)) {
    if (normalized(text) === command) return options.find((option) => words.some((word) => normalized(option.label || "").includes(word)))?.id;
  }
  return undefined;
}

/** Saves one Twitch chatter's last vote. Repeating a command replaces their vote. */
export async function acceptTwitchChatCommand(room: string, event: ChatEvent) {
  const text = event.message?.text?.trim() || "";
  const voterId = event.chatter_user_id || event.chatter_user_login;
  if (!text.startsWith("!") || !voterId) return { accepted: false, reason: "not-a-command" };
  const saved = await getRoom(room);
  const state = saved.state || {};
  const mode = String(state.mode || "");
  if (normalized(text) === "!свадьба") {
    saved.state = { ...state, lastChatCommand: { text, username: event.chatter_user_login || "гость", at: Date.now() } };
    await saveRoom(room, saved);
    return { accepted: true, kind: "help" };
  }
  if (!modeWithVotes.has(mode)) return { accepted: false, reason: "round-not-open" };
  const options = Array.isArray(state.chatOptions) ? state.chatOptions as ChatOption[] : [];
  let vote = choiceFromCommand(text, options);
  if (!vote && mode === "court") {
    const court = normalized(text).match(/^!суд\s+([1-4])$/);
    if (court) vote = options[Number(court[1]) - 1]?.id;
  }
  if (!vote) return { accepted: false, reason: "unknown-command" };
  const entry = { id: `twitch:${voterId}`, vote, at: Date.now() };
  const index = saved.votes.findIndex((item) => item.id === entry.id);
  if (index >= 0) saved.votes[index] = entry;
  else saved.votes = [...saved.votes, entry].slice(-250);
  await saveRoom(room, saved);
  return { accepted: true, kind: "vote", vote };
}
