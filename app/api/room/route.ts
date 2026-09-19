import { getRoom, newRoom, saveRoom, type Room } from "@/lib/room-store";

type RoomRequest = {
  room?: string;
  state?: Record<string, unknown>;
  vote?: string;
  voterId?: string;
  resetVotes?: boolean;
  answer?: string;
  player?: "vivi" | "hina";
  playerKey?: string;
  resetAnswers?: boolean;
  revealAnswers?: boolean;
};

function response(saved: Room, includePrivate = false) {
  return {
    state: saved.state,
    votes: saved.votes,
    answerStatus: Object.fromEntries(Object.keys(saved.privateAnswers).map((player) => [player, true])),
    ...(includePrivate ? { privateAnswers: saved.privateAnswers } : {}),
  };
}

export async function GET(request: Request) {
  const room = new URL(request.url).searchParams.get("room") || "VIVI-HINA";
  const saved = await getRoom(room);
  return Response.json({ room, ...response(saved) });
}

export async function POST(request: Request) {
  const body = await request.json() as RoomRequest;
  const room = body.room || "VIVI-HINA";
  const saved = await getRoom(room);
  if (body.resetVotes) saved.votes = [];
  if (body.resetAnswers) saved.privateAnswers = {};
  if (body.vote && body.voterId) {
    const entry = { id: String(body.voterId), vote: String(body.vote), at: Date.now() };
    const existing = saved.votes.findIndex((item) => item.id === entry.id);
    if (existing >= 0) saved.votes[existing] = entry;
    else saved.votes = [...saved.votes, entry].slice(-250);
  }
  if (body.answer && (body.player === "vivi" || body.player === "hina")) {
    const expectedKey = body.player === "vivi" ? process.env.VIVI_PLAYER_KEY : process.env.HINA_PLAYER_KEY;
    if (expectedKey && body.playerKey !== expectedKey) return Response.json({ ok: false, error: "Неверный ключ личного планшета." }, { status: 403 });
    saved.privateAnswers[body.player] = { value: String(body.answer), at: Date.now() };
  }
  if (body.state) saved.state = body.state;
  await saveRoom(room, saved);
  return Response.json({ ok: true, room, ...response(saved, Boolean(body.revealAnswers)) });
}

export async function DELETE(request: Request) {
  const room = new URL(request.url).searchParams.get("room") || "VIVI-HINA";
  const saved = newRoom();
  await saveRoom(room, saved);
  return Response.json({ ok: true, room, ...response(saved) });
}
