"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
const NO_SIDEBAR_ROUTES = ["/login", "/register"];

export function ConditionalSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');

    const update = () => {
      setIsMobile(media.matches);
      if (!media.matches) {
        setOpen(false);
      }
    };

    update();
    media.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  if (NO_SIDEBAR_ROUTES.includes(pathname)) return null;

  if (!isMobile) return null;

  return (
    <>
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-base)] shadow-lg"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden">
          <button
            aria-label="Close navigation overlay"
            className="absolute inset-0 w-full h-full"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(82vw,320px)] shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
