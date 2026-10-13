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

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <details ref={detailsRef} className="relative lg:hidden">
      <summary className="focus-ring cursor-pointer list-none rounded-full border border-white/35 px-4 py-2.5 text-xs font-bold uppercase">
        Menu
      </summary>
      <nav className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#211a16] p-3 shadow-2xl" aria-label="Navegação mobile">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeMenu} className="focus-ring block rounded-xl px-3 py-3 text-sm hover:bg-white/10">
            {item.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
