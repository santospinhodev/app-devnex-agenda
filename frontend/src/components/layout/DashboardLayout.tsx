"use client";

import { ReactNode, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, LucideIcon, User, Users } from "lucide-react";
import { Logo } from "@/src/components/Logo";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/src/components/ui/Button";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const BASE_NAV_ITEMS: NavItem[] = [
  {
    label: "Agenda",
    href: "/dashboard",
    icon: Calendar,
  },
  {
    label: "Perfil",
    href: "/profile",
    icon: User,
  },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Equipe",
    href: "/team",
    icon: Users,
  },
];

function NavEntry({
  item,
  isActive,
  layout,
}: {
  item: NavItem;
  isActive: boolean;
  layout: "sidebar" | "bottom";
}) {
  const ItemIcon = item.icon;
  const baseStyles =
    "flex rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const layoutStyles =
    layout === "sidebar"
      ? "items-center gap-2"
      : "flex-1 flex-col items-center gap-1 text-xs";
  const sidebarStyles = isActive
    ? "bg-primary/10 text-primary"
    : "text-slate-500 hover:text-primary";
  const bottomStyles = isActive
    ? "text-primary"
    : "text-slate-500 hover:text-primary";
  const disabledStyles = "cursor-not-allowed text-slate-300";
  const className = `${baseStyles} ${layoutStyles} ${
    layout === "sidebar" ? sidebarStyles : bottomStyles
  } ${item.disabled ? disabledStyles : ""}`;

  const content = (
    <>
      <ItemIcon className="h-4 w-4" aria-hidden />
      <span>{item.label}</span>
    </>
  );

  if (item.disabled) {
    return (
      <div className={className} aria-disabled>
        {content}
      </div>
    );
  }

  return (
    <Link className={className} href={item.href} prefetch={false}>
      {content}
    </Link>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated, isBootstrapping, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = useMemo(
    () => Boolean(user?.permissions?.includes("ADMIN")),
    [user]
  );
  const navItems = useMemo(
    () => [...BASE_NAV_ITEMS, ...(isAdmin ? ADMIN_NAV_ITEMS : [])],
    [isAdmin]
  );

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isBootstrapping, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Carregando painel...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-brand-navy">
      <aside className="hidden w-64 flex-col border-r border-brand-yellow bg-brand-navy px-6 py-8 lg:flex">
        <Logo size="sm" />
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavEntry
              key={item.label}
              item={item}
              isActive={pathname === item.href}
              layout="sidebar"
            />
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-brand-yellow bg-brand-navy backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div>
              <p className="text-sm text-white">Olá</p>
              <p className="text-xl font-semibold text-white">
                {user.name ?? "Barbeiro"}
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <nav className="sticky bottom-0 border-t border-white bg-brand-navy px-2 py-2 lg:hidden">
          <div className="flex items-center justify-between">
            {navItems.map((item) => (
              <NavEntry
                key={`${item.label}-mobile`}
                item={item}
                isActive={pathname === item.href}
                layout="bottom"
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
