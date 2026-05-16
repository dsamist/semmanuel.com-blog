import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.semmanuel.com";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/`);
  }

  try {
    await prisma.subscriber.update({
      where: { token },
      data: { confirmed: true },
    });
    logger.info("newsletter.confirmed", { token });
    await logger.flush();
    return NextResponse.redirect(`${SITE_URL}/subscribe/confirmed`);
  } catch {
    return NextResponse.redirect(`${SITE_URL}/`);
  }
}
