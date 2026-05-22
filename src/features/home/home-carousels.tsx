"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const slide = heroSlides[active];

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
            className="mt-8 inline-flex h-12 min-w-56 items-center justify-center border border-slate-950 bg-white/45 px-8 text-sm font-bold text-slate-950 backdrop-blur transition-colors hover:bg-slate-950 hover:text-white"
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
        className="absolute left-6 top-1/2 hidden -translate-y-1/2 md:flex"
        onClick={() =>
          setActive((current) => (current - 1 + heroSlides.length) % heroSlides.length)
        }
      />
      <CarouselButton
        direction="next"
        className="absolute right-6 top-1/2 hidden -translate-y-1/2 md:flex"
        onClick={() => setActive((current) => (current + 1) % heroSlides.length)}
      />
    </section>
  );
}

export function CategoryCarousel() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section className="py-10 md:py-12">
      <SectionHeader
        title="Escolha por categoria"
        onPrev={() => scrollRail(ref, -1)}
        onNext={() => scrollRail(ref, 1)}
      />
      <div
        ref={ref}
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

  return (
    <section id={id} className="py-10 md:py-12">
      <SectionHeader
        title={title}
        action="Ver mais"
        onPrev={() => scrollRail(ref, -1)}
        onNext={() => scrollRail(ref, 1)}
      />
      <div
        ref={ref}
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

  return (
    <section className="py-10 md:py-12">
      <SectionHeader
        title="Compre o look"
        action="Ver mais"
        onPrev={() => scrollRail(ref, -1)}
        onNext={() => scrollRail(ref, 1)}
      />
      <div
        ref={ref}
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
  const visibleItems = useMemo(() => {
    return [0, 1, 2].map((offset) => testimonials[(active + offset) % testimonials.length]);
  }, [active]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="border-t py-14 text-center">
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          <span className="hidden w-20 md:block" />
          <h2 className="text-2xl font-semibold text-slate-950">Depoimentos</h2>
          <div className="flex gap-3">
            <CarouselButton
              direction="prev"
              onClick={() =>
                setActive((current) => (current - 1 + testimonials.length) % testimonials.length)
              }
            />
            <CarouselButton
              direction="next"
              onClick={() => setActive((current) => (current + 1) % testimonials.length)}
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
          total={testimonials.length}
          active={active}
          onSelect={setActive}
          className="mx-auto mt-12 w-fit bg-transparent"
          dotClassName="bg-slate-950"
        />
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  action,
  onPrev,
  onNext
}: {
  title: string;
  action?: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mb-7 flex items-center justify-between gap-4 px-4 md:container">
      <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950 md:text-3xl">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {action ? (
          <a href="#catalogo" className="hidden text-sm font-bold underline underline-offset-4 md:block">
            {action}
          </a>
        ) : null}
        <CarouselButton direction="prev" onClick={onPrev} />
        <CarouselButton direction="next" onClick={onNext} />
      </div>
    </div>
  );
}

function CarouselButton({
  direction,
  onClick,
  className
}: {
  direction: "prev" | "next";
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Anterior" : "Proximo"}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full ${
        direction === "prev" ? "bg-slate-100 text-slate-500" : "bg-slate-950 text-white"
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

function scrollRail(ref: React.RefObject<HTMLDivElement | null>, direction: -1 | 1) {
  const element = ref.current;
  if (!element) return;

  element.scrollBy({
    left: direction * Math.max(280, element.clientWidth * 0.82),
    behavior: "smooth"
  });
}
