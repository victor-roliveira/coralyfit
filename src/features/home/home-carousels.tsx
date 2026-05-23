"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { ProductCard } from "@/features/catalog/product-card";
import type { CatalogProduct } from "@/features/catalog/types";

const heroSlides = [
  {
    eyebrow: "Drop Aura",
    title: "Coraly Fit",
    description:
      "O basico de treino com cor, conforto e modelagem para acompanhar sua rotina.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=85"
  },
  {
    eyebrow: "Lancamentos",
    title: "Treino leve",
    description:
      "Tops, leggings e conjuntos em tons suaves para treinar e viver o dia com liberdade.",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1800&q=85"
  },
  {
    eyebrow: "Mais vendidos",
    title: "Move com voce",
    description:
      "Pecas com toque macio, sustentacao equilibrada e estoque por tamanho e cor.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=85"
  }
];

const categories = [
  {
    title: "Conjuntos",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Leggings",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Tops",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Shorts",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Macacoes",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"
  }
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const slide = heroSlides[active];
  const isFirst = active === 0;
  const isLast = active === heroSlides.length - 1;

  return (
    <section className="relative min-h-[520px] overflow-hidden border-b md:min-h-[650px]">
      {heroSlides.map((item, index) => (
        <Image
          key={item.eyebrow}
          src={item.image}
          alt={`${item.title} Coraly Fit`}
          fill
          priority={index === 0}
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-700 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.74)_38%,rgba(255,255,255,0.08)_100%)]" />
      <div className="container relative flex min-h-[520px] items-center pb-12 pt-16 md:min-h-[650px]">
        <div className="max-w-xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-primary">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-black uppercase italic tracking-[0.08em] text-slate-950 md:text-7xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-700">
            {slide.description}
          </p>
          <a
            href="#catalogo"
            className="mt-8 inline-flex h-12 min-w-56 items-center justify-center bg-[#B500B2] px-8 text-sm font-bold text-white transition-colors hover:bg-[#8100D1]"
          >
            Comprar agora
          </a>
        </div>
        <CarouselDots
          total={heroSlides.length}
          active={active}
          onSelect={setActive}
          className="absolute bottom-5 left-1/2 -translate-x-1/2"
        />
      </div>
      <CarouselButton
        direction="prev"
        disabled={isFirst}
        className="absolute left-6 top-1/2 hidden -translate-y-1/2 md:flex"
        onClick={() => setActive((current) => Math.max(0, current - 1))}
      />
      <CarouselButton
        direction="next"
        disabled={isLast}
        className="absolute right-6 top-1/2 hidden -translate-y-1/2 md:flex"
        onClick={() => setActive((current) => Math.min(heroSlides.length - 1, current + 1))}
      />
    </section>
  );
}

export function CategoryCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useCarouselControls(ref);

  return (
    <section className="py-10 md:py-12">
      <SectionHeader
        title="Escolha por categoria"
        canPrev={controls.canPrev}
        canNext={controls.canNext}
        onPrev={() => scrollRail(ref, -1, controls.update)}
        onNext={() => scrollRail(ref, 1, controls.update)}
      />
      <div
        ref={ref}
        onScroll={controls.update}
        className="no-scrollbar grid auto-cols-[78vw] grid-flow-col gap-3 overflow-x-auto px-4 scroll-smooth sm:auto-cols-[42vw] md:auto-cols-[24vw]"
      >
        {categories.map((category) => (
          <a
            key={category.title}
            href="#catalogo"
            className="group relative h-[310px] overflow-hidden bg-slate-100"
          >
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(min-width: 768px) 25vw, 80vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/45 to-transparent" />
            <span className="absolute bottom-6 left-6 rounded-full bg-white px-8 py-4 text-sm font-black uppercase text-slate-950 shadow-sm">
              {category.title}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ProductCarousel({
  id,
  title,
  products,
  reverse
}: {
  id: string;
  title: string;
  products: CatalogProduct[];
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const displayProducts = useMemo(() => {
    const ordered = reverse ? [...products].reverse() : products;
    return ordered.concat(ordered).slice(0, 8);
  }, [products, reverse]);
  const controls = useCarouselControls(ref, [displayProducts.length]);

  return (
    <section id={id} className="py-10 md:py-12">
      <SectionHeader
        title={title}
        action="Ver mais"
        canPrev={controls.canPrev}
        canNext={controls.canNext}
        onPrev={() => scrollRail(ref, -1, controls.update)}
        onNext={() => scrollRail(ref, 1, controls.update)}
      />
      <div
        ref={ref}
        onScroll={controls.update}
        className="no-scrollbar grid auto-cols-[82vw] grid-flow-col gap-3 overflow-x-auto px-4 scroll-smooth sm:auto-cols-[42vw] lg:auto-cols-[20vw]"
      >
        {displayProducts.map((product, index) => (
          <ProductCard key={`${id}-${product.id}-${index}`} product={product} />
        ))}
      </div>
    </section>
  );
}

export function LookCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useCarouselControls(ref);

  return (
    <section className="py-10 md:py-12">
      <SectionHeader
        title="Compre o look"
        action="Ver mais"
        canPrev={controls.canPrev}
        canNext={controls.canNext}
        onPrev={() => scrollRail(ref, -1, controls.update)}
        onNext={() => scrollRail(ref, 1, controls.update)}
      />
      <div
        ref={ref}
        onScroll={controls.update}
        className="no-scrollbar grid auto-cols-[84vw] grid-flow-col gap-3 overflow-x-auto px-4 scroll-smooth md:auto-cols-[32vw] lg:auto-cols-[20vw]"
      >
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <a key={item} href="#catalogo" className="relative aspect-[0.72] overflow-hidden bg-slate-100">
            <Image
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80"
              alt="Look fitness Coraly Fit"
              fill
              sizes="(min-width: 1024px) 20vw, 84vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "Maravilhosa, amei",
    author: "Atayane T."
  },
  {
    quote: "Boa qualidade",
    author: "Nivanize R."
  },
  {
    quote: "Experiencia maravilhosa.",
    author: "Ana B."
  },
  {
    quote: "Entrega perfeita, troca perfeita.",
    author: "Katia F."
  },
  {
    quote: "Voltarei a comprar.",
    author: "Paula R."
  }
];

export function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const maxActive = Math.max(0, testimonials.length - 3);
  const visibleItems = useMemo(() => {
    return testimonials.slice(active, active + 3);
  }, [active]);

  return (
    <section className="border-t py-14 text-center">
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          <span className="hidden w-20 md:block" />
          <h2 className="text-2xl font-semibold text-[#462C7D]">Depoimentos</h2>
          <div className="flex gap-3">
            <CarouselButton
              direction="prev"
              disabled={active === 0}
              onClick={() => setActive((current) => Math.max(0, current - 1))}
            />
            <CarouselButton
              direction="next"
              disabled={active === maxActive}
              onClick={() => setActive((current) => Math.min(maxActive, current + 1))}
            />
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {visibleItems.map((item) => (
            <div key={`${item.author}-${item.quote}`} className="space-y-4">
              <div className="flex justify-center gap-0.5 text-[#ffb020]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="mx-auto max-w-xs text-lg font-bold leading-7 text-slate-950">
                {item.quote}
              </p>
              <p className="text-sm text-slate-600">{item.author}</p>
            </div>
          ))}
        </div>

        <CarouselDots
          total={maxActive + 1}
          active={active}
          onSelect={(index) => setActive(Math.min(index, maxActive))}
          className="mx-auto mt-12 w-fit bg-transparent"
          dotClassName="bg-[#B500B2]"
        />
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  action,
  canPrev,
  canNext,
  onPrev,
  onNext
}: {
  title: string;
  action?: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mb-7 flex items-center justify-between gap-4 px-4 md:container">
      <h2 className="text-2xl font-black uppercase tracking-tight text-[#462C7D] md:text-3xl">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {action ? (
          <a
            href="#catalogo"
            className="hidden text-sm font-bold underline underline-offset-4 transition-colors hover:text-[#B500B2] md:block"
          >
            {action}
          </a>
        ) : null}
        <CarouselButton direction="prev" disabled={!canPrev} onClick={onPrev} />
        <CarouselButton direction="next" disabled={!canNext} onClick={onNext} />
      </div>
    </div>
  );
}

function CarouselButton({
  direction,
  onClick,
  className,
  disabled = false
}: {
  direction: "prev" | "next";
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Anterior" : "Proximo"}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-white text-slate-400"
          : "border-[#B500B2] bg-[#B500B2] text-white hover:bg-[#8100D1]"
      } ${className ?? ""}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function CarouselDots({
  total,
  active,
  onSelect,
  className,
  dotClassName
}: {
  total: number;
  active: number;
  onSelect: (index: number) => void;
  className?: string;
  dotClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-full bg-white/45 px-4 py-2 backdrop-blur ${className ?? ""}`}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Ir para slide ${index + 1}`}
          onClick={() => onSelect(index)}
          className={`h-2 rounded-full transition-all ${dotClassName ?? "bg-white"} ${
            index === active ? "w-7" : "w-2 opacity-80"
          }`}
        />
      ))}
    </div>
  );
}

function scrollRail(
  ref: React.RefObject<HTMLDivElement | null>,
  direction: -1 | 1,
  onAfterScroll?: () => void
) {
  const element = ref.current;
  if (!element) return;

  element.scrollBy({
    left: direction * Math.max(280, element.clientWidth * 0.82),
    behavior: "smooth"
  });
  window.setTimeout(() => onAfterScroll?.(), 360);
}

function useCarouselControls(
  ref: React.RefObject<HTMLDivElement | null>,
  deps: React.DependencyList = []
) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    setCanPrev(element.scrollLeft > 2);
    setCanNext(element.scrollLeft + element.clientWidth < element.scrollWidth - 2);
  }, [ref]);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, ...deps]);

  return { canPrev, canNext, update };
}
