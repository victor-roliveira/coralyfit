"use client";

import { useEffect, useRef } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;
const STORAGE_KEY = "coralyfit:last-activity-at";

export function IdleSessionTimeout() {
  const loggingOut = useRef(false);

  useEffect(() => {
    const markActivity = () => {
      if (loggingOut.current) return;
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    };

    const logoutByIdle = async () => {
      if (loggingOut.current) return;
      loggingOut.current = true;

      try {
        if (!hasSupabaseEnv()) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        const supabase = createSupabaseBrowserClient();
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin"
        });
        localStorage.removeItem(STORAGE_KEY);
        window.location.assign("/login?expired=1");
      } finally {
        loggingOut.current = false;
      }
    };

    const checkIdleTime = () => {
      const lastActivity = Number(localStorage.getItem(STORAGE_KEY) ?? Date.now());
      if (Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        void logoutByIdle();
      }
    };

    const events: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart"
    ];

    if (!localStorage.getItem(STORAGE_KEY)) {
      markActivity();
    }

    events.forEach((event) => window.addEventListener(event, markActivity, { passive: true }));
    window.addEventListener("focus", checkIdleTime);
    document.addEventListener("visibilitychange", checkIdleTime);

    const interval = window.setInterval(checkIdleTime, CHECK_INTERVAL_MS);
    checkIdleTime();

    return () => {
      events.forEach((event) => window.removeEventListener(event, markActivity));
      window.removeEventListener("focus", checkIdleTime);
      document.removeEventListener("visibilitychange", checkIdleTime);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
