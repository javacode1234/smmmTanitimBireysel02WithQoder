import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import DomErrorBoundary from "@/components/dom-error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMMM - Profesyonel Mali Müşavirlik Hizmetleri",
  description: "Serbest Muhasebeci Mali Müşavir - Güvenilir mali danışmanlık ve muhasebe hizmetleri",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head suppressHydrationWarning />
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <DomErrorBoundary>
          <DynamicFavicon />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </DomErrorBoundary>
      </body>
    </html>
  );
}