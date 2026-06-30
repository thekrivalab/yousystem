"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Zap, DollarSign, 
  HeartPulse, Briefcase, Camera, Heart, Trophy, LayoutDashboard, Globe, Map, ListTodo,
  Settings, User, PlusSquare, FileText, Film, BookOpen
} from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";
import { t } from "@/lib/i18n";
import { useLifeOSStore } from "@/lib/store";

export const navCategories = [
  {
    titleKey: "life",
    items: [
      { nameKey: "dashboard", href: "/home", icon: LayoutDashboard },
      { nameKey: "routine", href: "/routine", icon: ListTodo },
      { nameKey: "habits", href: "/habits", icon: Zap },
      { nameKey: "achievements", href: "/achievements", icon: Trophy },
      { nameKey: "planning", href: "/planning", icon: PlusSquare },
    ]
  },
  {
    titleKey: "growth",
    items: [
      { nameKey: "finance", href: "/finance", icon: DollarSign },
      { nameKey: "health", href: "/health", icon: HeartPulse },
      { nameKey: "projects", href: "/projects", icon: Briefcase },
    ]
    },
  {
    titleKey: "travel",
    items: [
      { nameKey: "center-command", href: "/dashboard", icon: Globe },
      { nameKey: "world-map", href: "/map", icon: Map },
      { nameKey: "bucket-list", href: "/bucket-list", icon: ListTodo },
    ]
  },
  {
    titleKey: "more",
    items: [
      { nameKey: "dream-board", href: "/dreams", icon: Zap },
      { nameKey: "memories", href: "/memories", icon: Camera },
      { nameKey: "relationships", href: "/relationships", icon: Heart },
      { nameKey: "documents", href: "/documents", icon: FileText },
      { nameKey: "movies", href: "/movies", icon: Film },
      { nameKey: "library", href: "/library", icon: BookOpen },
    ]
  }
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const { locale } = useThemeStore();
  const userName = useLifeOSStore((s) => s.user.name);
  const avatarUrl = useLifeOSStore((s) => s.user.avatarUrl);

  const categoryLabel = (titleKey: string) => {
    if (titleKey === 'life') return locale === 'pt' ? 'Vida' : locale === 'es' ? 'Vida' : 'Life';
    if (titleKey === 'growth') return locale === 'pt' ? 'Crescimento' : locale === 'es' ? 'Crecimiento' : 'Growth';
    if (titleKey === 'travel') return locale === 'pt' ? 'Viagem' : locale === 'es' ? 'Viaje' : 'Travel';
    return locale === 'pt' ? 'Mais' : locale === 'es' ? 'Más' : 'More';
  };

  return (
    <div
      className="w-full h-full flex flex-col z-20 transition-colors duration-200 overflow-hidden"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      <div className="p-6">
        <Link href="/" onClick={onNavigate} className="text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--fg-base)' }}>
          <span
            className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(255,255,255,0.08)] shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)', color: 'var(--fg-base)' }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : 'Y'
            }
          </span>
          YouSystem
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {navCategories.map((category) => (
          <div key={category.titleKey}>
            <h2 className="text-[10px] font-bold uppercase tracking-wider transition-colors px-2 mb-2" style={{ color: 'var(--fg-subtle)' }}>
              {categoryLabel(category.titleKey)}
            </h2>
            <ul className="space-y-0.5">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const name = t(locale, 'nav', item.nameKey) || item.nameKey;

                  return (
                    <li key={item.nameKey}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 group hover:bg-[var(--bg-elevated)]`}
                        style={{ 
                          backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : undefined,
                          color: isActive ? 'var(--accent)' : 'var(--fg-muted)'
                        }}
                      >
                        <Icon
                          size={16}
                          className="group-hover:text-[var(--fg-base)] transition-colors"
                          style={{ color: isActive ? 'var(--accent)' : 'var(--fg-subtle)' }}
                        />
                        <span className="group-hover:text-[var(--fg-base)] transition-colors capitalize">{name.replace('-', ' ')}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 group hover:bg-[var(--bg-elevated)]`}
          style={{ 
            backgroundColor: pathname === '/settings' ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : undefined,
            color: pathname === '/settings' ? 'var(--accent)' : 'var(--fg-muted)'
          }}
        >
          <Settings size={16} className="group-hover:text-[var(--fg-base)] transition-colors" style={{ color: pathname === '/settings' ? 'var(--accent)' : 'var(--fg-subtle)' }} />
          <span className="group-hover:text-[var(--fg-base)] transition-colors">{t(locale, 'nav', 'settings') || 'Settings'}</span>
        </Link>
      </div>
    </div>
  );
}
