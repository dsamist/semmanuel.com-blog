export const dynamic = "force-dynamic"; // This disables SSG and ISR

import Form from "next/form";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function NewPost() {
  async function createPost(formData: FormData) {
    "use server";

    const authorEmail = (formData.get("authorEmail") as string) || undefined;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const postData = authorEmail
      ? {
          title,
          content,
          author: {
            connect: {
              email: authorEmail,
            },
          },
        }
      : {
          title,
          content,
        };

    await prisma.post.create({
      data: postData,
    });

    revalidatePath("/posts");
    redirect("/posts");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="font-mono text-sm text-cyan-400 mb-3">{'// new post'}</p>
        <h1 className="text-3xl font-extrabold text-slate-100">Write a Post</h1>
      </div>
      <Form action={createPost} className="space-y-6">
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
        <div>
          <label htmlFor="authorEmail" className="block text-sm font-medium text-slate-300 mb-2">Author Email</label>
          <input
            type="text"
            id="authorEmail"
            name="authorEmail"
            placeholder="author@email.com"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg transition-colors"
        >
          Publish Post
        </button>
      </Form>
    </div>
  );
}
