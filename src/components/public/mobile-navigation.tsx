"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type NavigationItem = { label: string; href: string };

export function MobileNavigation({ navigation }: { navigation: NavigationItem[] }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (detailsRef.current) detailsRef.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      const menu = detailsRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && detailsRef.current?.open) {
        detailsRef.current.open = false;
        detailsRef.current.querySelector("summary")?.focus();
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <details ref={detailsRef} className="relative lg:hidden">
      <summary className="focus-ring cursor-pointer list-none rounded-full border border-current/75 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--header-text)]">
        Menu
      </summary>
      <nav className="absolute right-0 mt-3 max-h-[min(75vh,36rem)] w-[min(19rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/20 bg-[var(--header-bg)] p-3 text-[var(--header-text)] shadow-2xl" aria-label="Navegação mobile">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeMenu} className="focus-ring block rounded-xl px-3 py-3 text-base font-semibold text-[var(--header-text)] hover:bg-white/15 hover:text-[var(--header-hover)]">
            {item.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
