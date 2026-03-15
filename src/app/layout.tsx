import { Toaster } from "@/components/ui/sonner";
import { ProfileProvider } from "@/context/ProfileContext";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Quironix - Panel de administración de deudas",
  description:
    "Quironix es una aplicación web que te permite gestionar tus deudas de manera fácil y rápida.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased`}>
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6452823,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <SessionProvider>
              <ProfileProvider>
                {children}
                <Toaster position="top-right" />
              </ProfileProvider>
            </SessionProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
