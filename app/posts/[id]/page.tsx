export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { logger, formatError, getRequestContext } from "@/lib/logger";

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id);

  let post;
  const start = Date.now();
  try {
    post = await prisma.post.findUnique({
      where: { id: postId, published: true },
      include: { author: true },
    });
  } catch (err) {
    logger.error("post.view.db_error", { postId, ...formatError(err), durationMs: Date.now() - start });
    await logger.flush();
    throw err;
  }

  if (!post) {
    logger.warn("post.view.not_found", { postId });
    await logger.flush();
    notFound();
  }

  const ctx = await getRequestContext();
  logger.info("post.viewed", {
    path: `/posts/${postId}`,
    postId,
    title: post!.title,
    author: post!.author?.name,
    durationMs: Date.now() - start,
    ...ctx,
  });
  await logger.flush();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <article>
        <div className="mb-8">
          <p className="font-mono text-sm text-cyan-400 mb-4">
            <Link href="/posts" className="hover:text-cyan-300 transition-colors">← All Posts</Link>
          </p>
          <h1 className="text-3xl font-extrabold text-slate-100 leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>by <span className="text-slate-300 font-medium">{post.author?.name || "Samuel Emmanuel"}</span></span>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-slate-300 text-base leading-relaxed">
          {post.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => <p className="mb-5">{children}</p>,
                h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-100 mt-10 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-100 mt-6 mb-2">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-outside pl-6 mb-5 space-y-1.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-outside pl-6 mb-5 space-y-1.5">{children}</ol>,
                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
                em: ({ children }) => <em className="italic text-slate-400">{children}</em>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-cyan-500/50 pl-4 my-5 text-slate-400 italic">{children}</blockquote>,
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock
                    ? <code className={className} {...props}>{children}</code>
                    : <code className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 text-sm font-mono" {...props}>{children}</code>;
                },
                pre: ({ children }) => <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto mb-5 text-sm">{children}</pre>,
                a: ({ href, children }) => <a href={href} className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer">{children}</a>,
                hr: () => <hr className="border-slate-700 my-8" />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          ) : (
            <p className="italic text-slate-500">No content available for this post.</p>
          )}
        </div>
      </article>

      <div className="mt-12 pt-8 border-t border-slate-800">
        <Link href="/posts" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">← Back to all posts</Link>
      </div>
    </div>
  );
}
