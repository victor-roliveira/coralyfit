import type { Metadata } from "next";
import { Jost } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartDrawer } from "@/features/cart/cart-drawer";
import "@/app/globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Coraly Fit",
  description: "Roupas de academia femininas, leves e modernas."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={jost.variable}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <CartDrawer />
      </body>
    </html>
  );
}
