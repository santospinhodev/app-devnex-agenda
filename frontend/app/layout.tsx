import type { Metadata } from "next";
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
