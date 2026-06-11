'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const tabs = [
  { href: "/qa", label: "Новые задачи" },
  { href: "/current", label: "Текущие задачи" },
  { href: "/completed", label: "Выполненные" },
  { href: "/stats", label: "Статистика" },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background shadow-sm">
      <div className="max-w-screen-2xl mx-auto flex overflow-x-auto px-6 py-3 gap-1 scrollbar-none items-center">
        <div className="flex items-center gap-2 mr-8 shrink-0 text-2xl font-bold text-foreground">
          <span>Stability</span>
        </div>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Button
              key={tab.href}
              asChild
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={isActive ? "shrink-0 rounded-lg px-4" : "shrink-0 px-4"}
            >
              <Link href={tab.href}>{tab.label}</Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
