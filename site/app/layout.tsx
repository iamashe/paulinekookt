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
      <body className="antialiased">{children}</body>
    </html>
  );
}
