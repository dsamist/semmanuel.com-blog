export const dynamic = "force-dynamic"; // This disables SSG and ISR

import Form from "next/form";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function NewPost() {
  async function createPost(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const authorName = (formData.get("authorName") as string)?.trim() || "Anonymous";

    if (!title?.trim()) return;

    // Generate a unique placeholder email so the author name is visible in the admin panel
    const placeholderEmail = `submission_${Date.now()}@blog-submission.internal`;

    await prisma.post.create({
      data: {
        title,
        content,
        published: false,
        author: {
          create: { email: placeholderEmail, name: authorName },
        },
      },
    });

    revalidatePath("/posts");
    redirect("/posts/submitted");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="font-mono text-sm text-cyan-400 mb-3">{'// new post'}</p>
        <h1 className="text-3xl font-extrabold text-slate-100">Write a Post</h1>
        <p className="text-slate-400 text-sm mt-2">
          Posts are reviewed before being published. You&apos;ll see it live once approved.
        </p>
      </div>
      <Form action={createPost} className="space-y-6">
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-slate-300 mb-2">
            Your Name <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="authorName"
            name="authorName"
            placeholder="e.g. Jane Doe"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>
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
            placeholder="Post title..."
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">Content</label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your post content here..."
            rows={10}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors resize-y"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors"
        >
          Submit for Review
        </button>
      </Form>
    </div>
  );
}
