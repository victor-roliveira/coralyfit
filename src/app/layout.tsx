import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";

import { IdleSessionTimeout } from "@/components/idle-session-timeout";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartDrawer } from "@/features/cart/cart-drawer";
import "@/app/globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--bricolage-grotesque",
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
    <html lang="pt-BR" className={bricolageGrotesque.variable}>
      <body>
        <ScrollToTop />
        <IdleSessionTimeout />
        <SiteHeader />
        {children}
        <SiteFooter />
        <CartDrawer />
      </body>
    </html>
  );
}
