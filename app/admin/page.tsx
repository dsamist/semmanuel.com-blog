export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { login, logout, approvePost, rejectPost } from "./actions";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed =
    !!process.env.ADMIN_KEY &&
    cookieStore.get("admin_auth")?.value === process.env.ADMIN_KEY;

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="font-mono text-sm text-cyan-400 mb-2">{'// admin'}</p>
            <h1 className="text-2xl font-bold text-slate-100">Admin Access</h1>
            <p className="text-slate-500 text-sm mt-1">Enter your admin key to continue</p>
          </div>
          <form action={login} className="space-y-4">
            <input
              type="password"
              name="key"
              required
              placeholder="Admin key..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingPosts = await prisma.post.findMany({
    where: { published: false },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-sm text-cyan-400 mb-2">{'// admin'}</p>
          <h1 className="text-3xl font-extrabold text-slate-100">Pending Posts</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pendingPosts.length} post{pendingPosts.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-slate-500 hover:text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-xl">
          <p className="text-slate-500">All caught up — no posts pending review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="mb-1 flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-100 leading-snug">
                  {post.title}
                </h2>
                <span className="shrink-0 text-xs font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                  pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
                {post.author?.name && <span className="ml-2">· by {post.author.name}</span>}
              </p>
              {post.content && (
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-4 mb-5 border-t border-slate-700 pt-4">
                  {post.content}
                </p>
              )}
              <div className="flex gap-3">
                <form action={approvePost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors"
                  >
                    Approve & Publish
                  </button>
                </form>
                <form action={rejectPost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
