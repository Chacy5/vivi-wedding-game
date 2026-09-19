import { syncDonations } from "@/lib/donation-alerts";

export async function GET() { return Response.json(await syncDonations()); }
