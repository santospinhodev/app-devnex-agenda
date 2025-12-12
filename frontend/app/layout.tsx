import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/src/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Devnex Agenda",
  description: "Painel de agendamentos e financeiro Devnex Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50">
        <Script id="sanitize-shortcut-attr" strategy="beforeInteractive">
          {`
            (() => {
              const TARGET_ATTR = "cz-shortcut-listen";
              const ensureBody = () => document.body ?? document.documentElement;

              const stripAttr = (el) => {
                if (el?.hasAttribute?.(TARGET_ATTR)) {
                  el.removeAttribute(TARGET_ATTR);
                }
              };

              const setupCleaner = () => {
                const htmlEl = document.documentElement;
                const bodyEl = ensureBody();
                [htmlEl, bodyEl].forEach(stripAttr);

                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === "attributes" && mutation.attributeName === TARGET_ATTR) {
                      stripAttr(mutation.target);
                    }
                  }
                });

                [htmlEl, bodyEl].forEach((el) => {
                  if (el) {
                    observer.observe(el, { attributes: true, attributeFilter: [TARGET_ATTR] });
                  }
                });
              };

              if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", setupCleaner, { once: true });
              } else {
                setupCleaner();
              }
            })();
          `}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
