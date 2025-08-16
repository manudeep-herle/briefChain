"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tabs({ TABS }) {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((t) => pathname.startsWith(t.href));

  return (
    <div className="ui-divider bg-white">
      <div className="mx-auto">
        <nav className="py-3">
          <div
            className="inline-flex p-1 rounded-full relative"
            style={{
              background:
                "linear-gradient(to right, #3b82f6, #6366f1, #8b5cf6)",
            }}
          >
            {/* Sliding background indicator */}
            <div
              className="absolute bg-white/50 rounded-full shadow-sm transition-all duration-300 ease-in-out"
              style={{
                width: `calc(${100 / TABS.length}% - 8px)`,
                height: "calc(100% - 8px)",
                left: `calc(${(activeIndex * 100) / TABS.length}% + 4px)`,
                top: "4px",
                zIndex: 1,
              }}
            />

            {TABS.map((t, index) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={[
                    "py-2 text-sm font-medium rounded-full transition-all duration-300 relative z-10 text-center",
                    active ? "text-gray-900" : "text-white/90 hover:text-white",
                  ].join(" ")}
                  style={{
                    width: `${100 / TABS.length}%`,
                    minWidth: "100px",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Tabs;
