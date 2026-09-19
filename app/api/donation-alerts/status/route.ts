import { config, donationStatus } from "@/lib/donation-alerts";

export async function GET() { return Response.json(await donationStatus()); }
export async function POST() { return Response.json(config()); }
