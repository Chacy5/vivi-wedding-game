import { readPersistent, writePersistent } from "@/lib/persistence";

export type Vote = { id: string; vote: string; at: number };
export type PrivateAnswer = { value: string; at: number };
export type Room = {
  state: Record<string, unknown> | null;
  votes: Vote[];
  privateAnswers: Record<string, PrivateAnswer>;
};

function roomKey(room: string) {
  return `room:${room.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "VIVI-HINA"}`;
}

export function newRoom(): Room {
  return { state: null, votes: [], privateAnswers: {} };
}

export async function getRoom(room: string) {
  return readPersistent(roomKey(room), newRoom());
}

export async function saveRoom(room: string, value: Room) {
  await writePersistent(roomKey(room), value);
  return value;
}

/** Updates are intentionally kept in one helper so API routes cannot forget persistence. */
export async function updateRoom(room: string, updater: (current: Room) => Room | void) {
  const current = await getRoom(room);
  const updated = updater(current) || current;
  return saveRoom(room, updated);
}
