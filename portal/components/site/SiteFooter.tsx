import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__shell">
        <Link href="/" className="public-footer__brand">
          <Image
            src="/site/shield-footer.png"
            alt="501 Elite Baseball"
            width={80}
            height={80}
          />

          <div>
            <strong>501 Elite Baseball</strong>
            <span>Hot Springs, Arkansas</span>
          </div>
        </Link>

        <p>Own Your Effort. Own Your Attitude. Own Your Future.</p>

        <nav aria-label="Footer navigation">
          <Link href="/parents">Parent Hub</Link>
          <Link href="/library">Library</Link>
          <Link href="/payments">Payments</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/os">501 Elite OS</Link>
        </nav>

        <div className="public-footer__contact">
          <a href="tel:15015201695">501-520-1695</a>
          <a href="mailto:info@501elitebaseball.org">
            info@501elitebaseball.org
          </a>
        </div>
      </div>

      <small>© 2026 501 Elite Baseball. All rights reserved.</small>
    </footer>
  );
}
