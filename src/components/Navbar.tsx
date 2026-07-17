import { useState } from "react";
import { Link } from "@tanstack/react-router";

const LINKS = [
  { label: "our approach", to: "/approach" as const },
  { label: "data", to: "/data" as const },
  { label: "demo", to: "/demo" as const },
  { label: "about us", to: null },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="absolute inset-x-0 top-0 z-30 px-4 pt-4 font-['Readex_Pro']">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-full bg-black px-6 py-3 shadow-lg md:py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}safesock-logo.png`}
            alt="SafeSock"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="text-base font-semibold tracking-tight text-white">
            SafeSock
          </span>
        </Link>

        {/* Nav links — inline on desktop, slide-in overlay on mobile */}
        <nav
          className={`flex flex-col items-center justify-center gap-8 text-base font-normal text-white/80 transition-[width] md:flex-row max-md:fixed max-md:left-0 max-md:top-0 max-md:z-40 max-md:h-full max-md:overflow-hidden max-md:bg-black/95 max-md:backdrop-blur ${
            menuOpen ? "max-md:w-full" : "max-md:w-0"
          }`}
        >
          {LINKS.map(({ label, to }) =>
            to ? (
              <Link
                key={label}
                to={to}
                onClick={closeMenu}
                className="whitespace-nowrap transition-colors"
                activeProps={{ className: "text-[#1E52F3]" }}
                inactiveProps={{ className: "hover:text-white" }}
              >
                {label}
              </Link>
            ) : (
              <a
                key={label}
                href="#"
                onClick={closeMenu}
                className="whitespace-nowrap transition-colors hover:text-white"
              >
                {label}
              </a>
            ),
          )}

          {/* Close (mobile only) */}
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="text-white md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle theme"
            className="flex size-8 items-center justify-center rounded-md border border-white/20 text-white transition hover:bg-white/10"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 10.39a2.889 2.889 0 1 0 0-5.779 2.889 2.889 0 0 0 0 5.778M7.5 1v.722m0 11.556V14M1 7.5h.722m11.556 0h.723m-1.904-4.596-.511.51m-8.172 8.171-.51.511m-.001-9.192.51.51m8.173 8.171.51.511"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <a
            href="#"
            className="hidden rounded-full bg-[#1E52F3] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1A46CF] md:flex"
          >
            partner with us
          </a>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="text-white md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
    </div>
  );
}
