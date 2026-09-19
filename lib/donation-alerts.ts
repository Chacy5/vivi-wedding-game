import { actionForAmount, type DonationEvent } from "@/lib/donation-game";
import { readPersistent, writePersistent } from "@/lib/persistence";

type DaAlert = { id?: number | string; username?: string; message?: string; amount?: number | string; currency?: string; created_at?: string };
type Runtime = { accessToken?: string; recentIds: Set<string>; pending: DonationEvent[]; recent: DonationEvent[]; seeded: boolean };
const runtime: Runtime = { recentIds: new Set(), pending: [], recent: [], seeded: false };
type StoredRuntime = Omit<Runtime, "recentIds"> & { recentIds: string[] };

async function hydrate() {
  const stored = await readPersistent<StoredRuntime | null>("donation-alerts", null);
  if (!stored) return;
  runtime.accessToken = stored.accessToken;
  runtime.recentIds = new Set(stored.recentIds || []);
  runtime.pending = stored.pending || [];
  runtime.recent = stored.recent || [];
  runtime.seeded = Boolean(stored.seeded);
}
async function persist() {
  await writePersistent<StoredRuntime>("donation-alerts", { ...runtime, recentIds: [...runtime.recentIds] });
}

export function config() {
  return {
    donationUrl: process.env.DONATIONALERTS_DONATION_URL || "https://www.donationalerts.com/r/vivi_frox",
    canConnect: Boolean(process.env.DONATIONALERTS_CLIENT_ID && process.env.DONATIONALERTS_CLIENT_SECRET),
    connected: Boolean(runtime.accessToken || process.env.DONATIONALERTS_ACCESS_TOKEN),
  };
}
export async function donationStatus() { await hydrate(); return { ...config(), recent: runtime.recent }; }

export async function setAccessToken(accessToken: string) { await hydrate(); runtime.accessToken = accessToken; runtime.seeded = false; runtime.recentIds.clear(); await persist(); }
function token() { return runtime.accessToken || process.env.DONATIONALERTS_ACCESS_TOKEN; }
function toEvent(alert: DaAlert, isTest = false): DonationEvent {
  const amount = Number(alert.amount || 0);
  return { id: String(alert.id || `test-${Date.now()}`), username: alert.username || "Анонимный свидетель", message: alert.message || "", amount, currency: alert.currency || "RUB", createdAt: alert.created_at || new Date().toISOString(), isTest, action: actionForAmount(amount) };
}
function remember(event: DonationEvent, pending: boolean) { runtime.recent = [event, ...runtime.recent.filter((item) => item.id !== event.id)].slice(0, 30); if (pending) runtime.pending.push(event); }

export async function syncDonations() {
  await hydrate();
  const accessToken = token();
  if (!accessToken) return { ...config(), events: await takePending(), recent: runtime.recent, error: "Нужна авторизация DonationAlerts или DONATIONALERTS_ACCESS_TOKEN." };
  const response = await fetch("https://www.donationalerts.com/api/v1/alerts/donations?per_page=20", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  if (!response.ok) return { ...config(), events: await takePending(), recent: runtime.recent, error: `DonationAlerts вернул ${response.status}. Проверь подключение.` };
  const payload = await response.json() as { data?: DaAlert[] };
  const incoming = (payload.data || []).map((alert) => toEvent(alert));
  if (!runtime.seeded) { incoming.forEach((event) => runtime.recentIds.add(event.id)); runtime.seeded = true; incoming.forEach((event) => remember(event, false)); await persist(); return { ...config(), events: await takePending(), recent: runtime.recent }; }
  incoming.reverse().forEach((event) => { if (!runtime.recentIds.has(event.id)) { runtime.recentIds.add(event.id); remember(event, true); } });
  await persist();
  return { ...config(), events: await takePending(), recent: runtime.recent };
}
export async function takePending() { await hydrate(); const events = runtime.pending; runtime.pending = []; await persist(); return events; }
export async function createTestDonation(input: { amount: number; username?: string; message?: string }) { await hydrate(); const event = toEvent({ id: `test-${Date.now()}`, amount: input.amount, username: input.username || "Тестовый свидетель", message: input.message || "Проверка свадебной кассы", currency: "RUB", created_at: new Date().toISOString() }, true); remember(event, true); await persist(); return event; }
