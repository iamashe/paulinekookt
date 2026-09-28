import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pauline kookt | Borrelboxen, lunch & buffetten in Arcen",
  description: "Persoonlijke catering vanuit Arcen. Borrelboxen, lunch, brunch en warme of koude buffetten voor jouw feest of bedrijf. Een voorstel op maat, antwoord binnen 48 uur.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <style>{"#nl-badge-frame, #nl-hud-frame, iframe[id^=nl-] { display: none !important; }"}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              /* Netlify free-plan HUD: without data-nf-variant the injected script bails silently. */
              new MutationObserver(function () {
                document.querySelectorAll('script[data-netlify-site-id]').forEach(function (s) {
                  s.removeAttribute('data-nf-variant');
                });
              }).observe(document.documentElement, { childList: true, subtree: true });
            `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
