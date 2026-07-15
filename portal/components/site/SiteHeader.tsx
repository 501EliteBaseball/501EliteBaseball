"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/about", label: "About" },
  { href: "/teams", label: "Teams" },
  { href: "/parents", label: "Parents" },
  { href: "/library", label: "Library" },
  { href: "/training", label: "Training" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/give", label: "Give" },
  { href: "/payments", label: "Payments" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="public-header">
      <div className="public-header__shell">
        <Link
          href="/"
          aria-label="501 Elite Baseball home"
          className="public-header__brand"
        >
          <Image
            src="/brand/501-elite-wordmark.png"
            alt="501 Elite Baseball"
            width={320}
            height={74}
            priority
          />
        </Link>

        <nav className="public-header__desktop-nav" aria-label="Main navigation">
          {navigation.slice(0, 7).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-header__actions">
          <Link href="/os" className="os-link">
            501 Elite OS
          </Link>

          <button
            type="button"
            className={`menu-button ${open ? "is-open" : ""}`}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="site-navigation-panel"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="site-navigation-panel"
        className={`navigation-panel ${open ? "is-open" : ""}`}
      >
        <nav aria-label="Expanded navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "is-active" : undefined}
            >
              <span>{item.label}</span>
              <b aria-hidden="true">→</b>
            </Link>
          ))}

          <Link
            href="/os"
            className={
              pathname.startsWith("/os")
                ? "is-active os-panel-link"
                : "os-panel-link"
            }
          >
            <span>501 Elite OS</span>
            <b aria-hidden="true">→</b>
          </Link>
        </nav>
      </div>
    </header>
  );
}
