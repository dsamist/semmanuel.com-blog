"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function login(formData: FormData) {
  const key = formData.get("key") as string;
  if (key && key === process.env.ADMIN_KEY) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", key, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/admin");
}

export async function approvePost(postId: number) {
  await prisma.post.update({
    where: { id: postId },
    data: { published: true },
  });
  redirect("/admin");
}

export async function rejectPost(postId: number) {
  await prisma.post.delete({
    where: { id: postId },
  });
  redirect("/admin");
}
