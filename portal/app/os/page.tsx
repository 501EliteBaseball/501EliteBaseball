import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

export default function EliteOSPage() {
  return (
    <>
      <SiteHeader />

      <main className="os-page">
        <section className="os-hero">
          <Image
            src="/brand/501-elite-wordmark.png"
            alt="501 Elite Baseball"
            width={260}
            height={170}
            priority
          />

          <p className="section-kicker">501 Elite OS</p>

          <h1>Your family’s home base.</h1>

          <p>
            Register players, securely manage family information, and access
            your 501 Elite experience.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="pill-cta pill-cta--red">
              Create Family Account
            </Link>

            <Link href="/login" className="pill-cta pill-cta--navy">
              Parent Sign In
            </Link>

            <Link
              href="/staff/login"
              className="pill-cta"
              style={{ background: "#ffffff", borderColor: "#ffffff", color: "#123E74" }}
            >
              Staff Sign In
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
