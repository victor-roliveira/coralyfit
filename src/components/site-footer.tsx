import Link from "next/link";
import { Globe2, Mail, MessageCircle, Music2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const helpLinks = [
  "FAQ",
  "Troca e devolucao",
  "Como comprar?",
  "Rastrear pedido",
  "Fale conosco"
];

const pageLinks = [
  "Sobre nos",
  "Sustentabilidade",
  "Politica de privacidade",
  "Termos e condicoes"
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.35fr]">
        <FooterColumn title="Ajuda" links={helpLinks} />
        <FooterColumn title="Pagina" links={pageLinks} />
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-950">
            Redes sociais
          </h2>
          <div className="mt-5 flex gap-3">
            {[Globe2, Music2, MessageCircle, Mail].map((Icon, index) => (
              <Link
                key={index}
                href="/"
                aria-label="Rede social Coraly Fit"
                className="flex h-10 w-10 items-center justify-center rounded-md border text-slate-950 transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
          <p className="mt-6 max-w-xs text-sm leading-6 text-slate-600">
            Coraly Fit Comercio de Roupas e Acessorios LTDA
            <br />
            CNPJ: 00.000.000/0001-00
            <br />
            Brasil
          </p>
        </div>
        <div>
          <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-950">
            Receba novidades
          </h2>
          <div className="mt-5 space-y-3">
            <Input placeholder="Nome" className="h-12 rounded-none border-0 bg-slate-100" />
            <Input placeholder="E-mail" className="h-12 rounded-none border-0 bg-slate-100" />
            <Button className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-primary">
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-950">
        {title}
      </h2>
      <ul className="mt-5 space-y-2.5">
        {links.map((link) => (
          <li key={link}>
            <Link href="/" className="text-sm text-slate-500 hover:text-primary">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
