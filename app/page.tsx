export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === "prisma+postgres://accelerate.prisma-data.net/?api_key=API_KEY") {
    redirect("/setup");
  }

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="mb-14">
        <p className="font-mono text-sm text-cyan-400 mb-3">// latest posts</p>
        <h1 className="text-4xl font-extrabold text-slate-100 mb-4">Cloud &amp; DevOps Insights</h1>
        <p className="text-slate-400 max-w-xl">
          Practical notes on platform engineering, Kubernetes, AWS, Terraform, and the realities of managing infrastructure at scale.
        </p>
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <p className="text-slate-500 italic">No posts yet — check back soon.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="group">
              <div className="h-full bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-200">
                <h2 className="text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors mb-3 leading-snug">
                  {post.title}
                </h2>
                <p className="text-slate-500 text-xs mb-3">
                  {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  {post.author && <span className="ml-2">· {post.author.name}</span>}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {post.content || "No content available."}
                </p>
                <p className="mt-4 text-xs font-mono text-cyan-500 group-hover:text-cyan-300 transition-colors">
                  Read more →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/posts" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors border border-slate-700 hover:border-cyan-500/40 px-5 py-2 rounded-lg">
          View all posts →
        </Link>
      </div>
    </div>
  );
}
