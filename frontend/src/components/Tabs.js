"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tabs({ TABS }) {
  const pathname = usePathname();

  return (
    <div className="border-b bg-white">
      <div className="mx-auto">
        <nav className="flex gap-2 py-3">
          {TABS.map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={[
                  "px-3 py-1.5 rounded-md text-sm",
                  active
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default Tabs;
