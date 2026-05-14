import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level = "error", event, fields = {} } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (level === "info") logger.info(event, fields);
    else if (level === "warn") logger.warn(event, fields);
    else logger.error(event, fields);

    await logger.flush();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
