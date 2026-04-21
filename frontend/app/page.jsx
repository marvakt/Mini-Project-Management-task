"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      router.replace("/dashboard/projects");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef8f2] px-4">
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="auth-orb auth-orb--one pointer-events-none absolute -left-12 top-16 h-44 w-44 rounded-full bg-[#c2f6e4]" />
      <div className="auth-orb auth-orb--two pointer-events-none absolute bottom-10 right-12 h-48 w-48 rounded-full bg-[#b7eee8]" />

      <div className="relative rounded-[30px] border border-white/70 bg-white/85 px-10 py-9 text-center shadow-[0_36px_80px_-46px_rgba(23,54,43,0.38)] backdrop-blur-xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[3px] border-[#d7f6ee] border-t-[#13c7a5]" />
        <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#20324d]">
          Loading your workspace
        </p>
        <p className="mt-2 text-sm text-[#708096]">
          Redirecting you to the right place.
        </p>
      </div>
    </div>
  );
}
