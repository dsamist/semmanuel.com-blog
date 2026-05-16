export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { login, logout, approvePost, rejectPost } from "./actions";
import { logger, getRequestContext } from "@/lib/logger";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

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
    where: { published: false, rejectionReason: null },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  const ctx = await getRequestContext();
  logger.info("admin.panel.viewed", { path: "/admin", pendingCount: pendingPosts.length, ...ctx });
  await logger.flush();

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
                <div className="max-h-[36rem] overflow-y-auto mb-5 border-t border-slate-700 pt-4 text-slate-300 text-sm leading-relaxed pr-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      p: ({ children }) => <p className="mb-4">{children}</p>,
                      h1: ({ children }) => <h1 className="text-xl font-bold text-slate-100 mt-8 mb-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold text-slate-100 mt-6 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-semibold text-slate-100 mt-4 mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-slate-300">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-cyan-500/50 pl-4 my-4 text-slate-400 italic">{children}</blockquote>,
                      code: ({ className, children, ...props }) => {
                        const isBlock = className?.includes("language-");
                        return isBlock
                          ? <code className={className} {...props}>{children}</code>
                          : <code className="px-1.5 py-0.5 bg-slate-900 border border-slate-600 rounded text-cyan-300 text-xs font-mono" {...props}>{children}</code>;
                      },
                      pre: ({ children }) => <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto mb-4 text-xs">{children}</pre>,
                      hr: () => <hr className="border-slate-700 my-6" />,
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <form action={approvePost.bind(null, post.id)}>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors"
                    >
                      Approve & Publish
                    </button>
                  </form>
                </div>
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <span className="inline-block px-4 py-2 text-sm border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      Reject ↓
                    </span>
                  </summary>
                  <form action={rejectPost.bind(null, post.id)} className="mt-3 space-y-3">
                    {post.author?.email && !post.author.email.endsWith("@blog-submission.internal") && (
                      <p className="text-xs text-slate-500">
                        A rejection email will be sent to <span className="text-slate-300">{post.author.email}</span>
                      </p>
                    )}
                    <textarea
                      name="reason"
                      required
                      rows={3}
                      placeholder="Explain what needs to be changed..."
                      className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-y"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-medium rounded-lg transition-colors"
                    >
                      Send Rejection
                    </button>
                  </form>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
