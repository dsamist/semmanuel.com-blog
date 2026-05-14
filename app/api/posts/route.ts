import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logger, formatError } from "@/lib/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const postsPerPage = 5;
  const offset = (page - 1) * postsPerPage;
  const start = Date.now();

  try {
    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        skip: offset,
        take: postsPerPage,
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      }),
      prisma.post.count({ where: { published: true } }),
    ]);

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    logger.info("api.posts.fetched", {
      page,
      count: posts.length,
      totalPosts,
      totalPages,
      durationMs: Date.now() - start,
    });
    await logger.flush();

    return NextResponse.json({ posts, totalPages });
  } catch (err) {
    logger.error("api.posts.error", {
      page,
      ...formatError(err),
      durationMs: Date.now() - start,
    });
    await logger.flush();
    throw err;
  }
}
