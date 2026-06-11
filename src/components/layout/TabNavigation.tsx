'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const tabs = [
  { href: "/qa", label: "Новые задачи / QA" },
  { href: "/current", label: "Текущие задачи" },
  { href: "/completed", label: "Выполненные" },
  { href: "/stats", label: "Статистика" },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background">
      <div className="flex overflow-x-auto px-4 py-2 gap-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Button
              key={tab.href}
              asChild
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="shrink-0"
            >
              <Link href={tab.href}>{tab.label}</Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
