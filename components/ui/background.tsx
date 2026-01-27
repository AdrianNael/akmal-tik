"use client";

import { cn } from "@/lib/utils";


export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-grid-black/[0.1] -z-10 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] dark:bg-grid-white/[0.1] dark:[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent -z-20 blur-3xl opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 via-transparent to-transparent -z-20 blur-3xl opacity-40" />
    </div>
  );
}
