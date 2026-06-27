'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { StabilityRibbon } from "@/components/shared/StabilityRibbon";

const tabs = [
  { href: "/qa", label: "Новые задачи" },
  { href: "/current", label: "Текущие задачи" },
  { href: "/completed", label: "Выполненные" },
  { href: "/stats", label: "Статистика" },
  { href: "/charts", label: "Графики" },
];

export default function TabNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    window.location.reload();
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0f172a] text-slate-100">
      <div className="max-w-screen-2xl mx-auto flex overflow-x-auto px-4 py-3 sm:px-6 gap-1 scrollbar-none items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 mr-8 shrink-0"
        >
          <Logo size={36} arrows={false} gearFill="#ffffff" className="shrink-0" />
          <span className="text-xl font-bold tracking-tight text-white">
            Stabana
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Button
                key={tab.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "shrink-0 rounded-lg px-4",
                  isActive
                    ? "bg-white/15 text-white hover:bg-white/15 hover:text-white aria-expanded:bg-white/15"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Link href={tab.href}>{tab.label}</Link>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="shrink-0 px-2 sm:px-3 text-slate-300 hover:bg-white/10 hover:text-white"
            title="Выйти"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Выйти</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 shrink-0 text-slate-200 hover:bg-white/10 hover:text-white"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0f172a] px-3 py-2 flex flex-col gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Button
                key={tab.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-white/15 text-white hover:bg-white/15 hover:text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Link href={tab.href}>{tab.label}</Link>
              </Button>
            );
          })}
        </div>
      )}
      <StabilityRibbon />
    </nav>
  );
}
