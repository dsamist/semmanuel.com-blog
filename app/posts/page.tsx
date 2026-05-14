"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  content?: string;
  createdAt: string;
  author?: {
    name: string;
  };
}

// Disable static generation
export const dynamic = "force-dynamic";

function PostsList() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/posts?page=${page}`);
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await res.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [page]);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2 min-h-[200px]">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {posts.length === 0 ? (
            <p className="text-slate-500 italic">No posts yet — check back soon.</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/40 transition-colors">
                  <Link href={`/posts/${post.id}`} className="text-lg font-semibold text-slate-100 hover:text-cyan-400 transition-colors">
                    {post.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    {post.author?.name && <span className="ml-2">· {post.author.name}</span>}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-center gap-3 mt-10">
            {page > 1 && (
              <Link href={`/posts?page=${page - 1}`} className="px-4 py-2 text-sm border border-slate-700 text-slate-400 rounded-lg hover:border-cyan-500/40 hover:text-cyan-400 transition-colors">
                ← Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/posts?page=${page + 1}`} className="px-4 py-2 text-sm border border-slate-700 text-slate-400 rounded-lg hover:border-cyan-500/40 hover:text-cyan-400 transition-colors">
                Next →
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function PostsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="font-mono text-sm text-cyan-400 mb-3">{'// all posts'}</p>
        <h1 className="text-3xl font-extrabold text-slate-100">All Posts</h1>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-slate-500 py-12">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            Loading posts...
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  );
}
