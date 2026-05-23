"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import favoriteIcon from "@/assets/images/icone-favorito.svg";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  productId: string;
  initialFavorited?: boolean;
  className?: string;
  onFavoriteChange?: (favorited: boolean) => void;
};

export function FavoriteButton({
  productId,
  initialFavorited = false,
  className,
  onFavoriteChange
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleFavorite() {
    if (pending) return;

    startTransition(async () => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!response.ok) return;

      const payload = (await response.json()) as { favorited: boolean };
      setFavorited(payload.favorited);
      onFavoriteChange?.(payload.favorited);
      setBurst(payload.favorited);
      window.setTimeout(() => setBurst(false), 650);
    });
  }

  return (
    <button
      type="button"
      aria-label={favorited ? "Remover dos favoritos" : "Favoritar produto"}
      aria-pressed={favorited}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite();
      }}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm transition-transform hover:scale-105 disabled:opacity-70",
        favorited && "text-primary",
        className
      )}
      disabled={pending}
    >
      <Image
        src={favoriteIcon}
        alt=""
        className={cn(
          "h-6 w-6 transition-transform duration-300",
          favorited && "scale-110 [filter:invert(47%)_sepia(89%)_saturate(2034%)_hue-rotate(219deg)_brightness(101%)_contrast(101%)]",
          burst && "animate-[favorite-pop_650ms_ease-out]"
        )}
      />
      {burst ? (
        <>
          <span className="pointer-events-none absolute h-12 w-12 animate-[favorite-ring_650ms_ease-out] rounded-full border-2 border-primary" />
          <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 animate-[favorite-spark_650ms_ease-out] rounded-full bg-accent" />
          <span className="pointer-events-none absolute -bottom-1 left-1 h-2 w-2 animate-[favorite-spark_650ms_ease-out] rounded-full bg-secondary" />
        </>
      ) : null}
    </button>
  );
}
