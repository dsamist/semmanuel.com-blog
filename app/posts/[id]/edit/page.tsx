export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Form from "next/form";
import { logger, formatError } from "@/lib/logger";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, content: true, rejectionReason: true, published: true },
  });

  if (!post || post.published) {
    logger.warn("post.edit.not_found", { postId });
    await logger.flush();
    notFound();
  }

  logger.info("post.edit.opened", {
    postId,
    title: post.title,
    wasRejected: !!post.rejectionReason,
  });
  await logger.flush();

  async function updatePost(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title?.trim()) return;

    const start = Date.now();
    try {
      await prisma.post.update({
        where: { id: postId },
        data: { title, content, rejectionReason: null },
      });
      logger.info("post.resubmitted", {
        postId,
        title,
        contentLength: content?.length ?? 0,
        durationMs: Date.now() - start,
      });
    } catch (err) {
      logger.error("post.resubmit.error", {
        postId,
        ...formatError(err),
        durationMs: Date.now() - start,
      });
      await logger.flush();
      throw err;
    }

    revalidatePath("/posts");
    await logger.flush();
    redirect("/posts/submitted");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="font-mono text-sm text-cyan-400 mb-3">{'// edit post'}</p>
        <h1 className="text-3xl font-extrabold text-slate-100">Update Your Post</h1>
        <p className="text-slate-400 text-sm mt-2">
          Make your changes below and resubmit for review.
        </p>
      </div>

      {post.rejectionReason && (
        <div className="mb-8 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <p className="text-xs font-mono text-amber-400 mb-1">{'// feedback'}</p>
          <p className="text-sm text-amber-200 leading-relaxed">{post.rejectionReason}</p>
        </div>
      )}

      <Form action={updatePost} className="space-y-6">
        <div>
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            Title
            <span className="px-2 py-0.5 text-xs font-mono bg-slate-700 text-slate-400 rounded">required</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={post.title}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">Content</label>
          <textarea
            id="content"
            name="content"
            rows={12}
            defaultValue={post.content ?? ""}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors resize-y"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors"
        >
          Resubmit for Review
        </button>
      </Form>
    </div>
  );
}
