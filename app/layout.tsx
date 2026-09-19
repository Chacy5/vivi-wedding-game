import type { Metadata } from "next";
import "./globals.css";
import "./extra.css";
import "./votes.css";
import "./donations.css";
import "./donation-overlay.css";

export const metadata: Metadata = {
  title: "Тест на соулмейта",
  description: "Интерактивная экранная игра для свадебного VTuber-стрима.",
  other: {
    "codex-preview": "development",
  },
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
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
