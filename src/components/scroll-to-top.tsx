"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const scroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    window.requestAnimationFrame(scroll);
    const timeout = window.setTimeout(scroll, 80);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return null;
}
