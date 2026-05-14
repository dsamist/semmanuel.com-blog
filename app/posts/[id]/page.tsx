export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Server action to delete the post
  async function deletePost() {
    "use server";

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    redirect("/posts");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <article>
        <div className="mb-8">
          <p className="font-mono text-sm text-cyan-400 mb-4">
            <a href="/posts" className="hover:text-cyan-300 transition-colors">← All Posts</a>
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

        <div className="border-t border-slate-800 pt-8 text-slate-300 text-base leading-relaxed space-y-5">
          {post.content ? (
            <p>{post.content}</p>
          ) : (
            <p className="italic text-slate-500">No content available for this post.</p>
          )}
        </div>
      </article>

      <div className="mt-12 pt-8 border-t border-slate-800">
        <a href="/posts" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">← Back to all posts</a>
      </div>
    </div>
  );
}
