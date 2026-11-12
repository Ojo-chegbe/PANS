"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./Brand";
import { BasketToggle } from "./Cart";
export function Header({
  navigation,
  signedIn,
}: {
  navigation: { label: string; url: string }[];
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const outside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("click", outside);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("click", outside);
    };
  }, []);
  return (
    <header ref={ref}>
      <nav aria-label="Main navigation">
        <Brand />
        <div
          className={"nav-links" + (open ? " open" : "")}
          id="main-navigation"
        >
          {navigation.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.url ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="mobile-account-link"
            href={signedIn ? "/account" : "/sign-in"}
            onClick={() => setOpen(false)}
          >
            {signedIn ? "Your account" : "Sign in"}
          </Link>
        </div>
        <form
          action="/search"
          className="search-box header-search"
          role="search"
        >
          <label className="sr-only" htmlFor="global-search">
            Search the Hub
          </label>
          <input
            id="global-search"
            type="search"
            name="q"
            placeholder="Search the Hub"
            required
          />
        </form>
        <div className="nav-actions">
          <Link
            href={signedIn ? "/account" : "/sign-in"}
            className="account-link"
          >
            {signedIn ? "Account" : "Sign in"}
          </Link>
          <BasketToggle />
          <button
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
    </header>
  );
}
