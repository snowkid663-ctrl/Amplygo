import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import Reveal from "@/components/Reveal";
import LiveCampaignCard from "@/components/LiveCampaignCard";
import VideoTile from "@/components/VideoTile";
import ProductShowcase from "@/components/ProductShowcase";
import PlatformIcon from "@/components/PlatformIcon";
import CountUp from "@/components/CountUp";

const heroStats = [
  { n: 200, suffix: "+", decimals: 0, k: "Creators" },
  { n: 35, suffix: "", decimals: 0, k: "Active Campaigns" },
  { n: 4.2, suffix: "M", decimals: 1, k: "Views Generated" },
  { n: 10, suffix: "", decimals: 0, k: "Countries" },
];

const traditionalCons = [
  "Expensive upfront payments",
  "Weeks negotiating with creators",
  "One creator = one audience",
  "Difficult to scale",
  "High risk if the content flops",
];
const amplygoPros = [
  "Pay only for performance",
  "Hundreds of creators available",
  "Continuous content generation",
  "Scale campaigns instantly",
  "Performance-driven",
];

const companyCards = [
  { icon: "📈", title: "Launch unlimited campaigns", body: "Set your own CPM and total budget." },
  { icon: "🌎", title: "Reach thousands of audiences", body: "Instead of relying on one influencer, let hundreds of creators compete." },
  { icon: "💸", title: "Pay only for results", body: "Every dollar goes toward actual performance." },
  { icon: "⚡", title: "Scale whenever you want", body: "Increase your budget and instantly attract more creators." },
];

const creatorCards = [
  { icon: "💰", title: "Earn from every view", body: "No fixed sponsorships required." },
  { icon: "🚀", title: "Join campaigns instantly", body: "No emails. No negotiations." },
  { icon: "🌍", title: "Work with companies worldwide", body: "Build your portfolio while earning." },
  { icon: "📈", title: "Grow your audience", body: "The better your content performs, the more you earn." },
];

const flow = [
  "Company launches campaign",
  "Creators join",
  "Videos get published",
  "Performance is reviewed",
  "Creators get paid",
  "Company receives results",
];

const creatorLoves = ["No cold DMs", "No waiting weeks", "No contracts", "No negotiations", "Instant opportunities"];
const companyLoves = [
  "Hundreds of creators promoting simultaneously",
  "Lower CAC",
  "Continuous UGC production",
  "Pay only for verified results",
  "Discover new creators automatically",
];

const dashboardStats = [
  { k: "Budget", v: "$2,500" },
  { k: "CPM", v: "$4" },
  { k: "Creators", v: "183" },
  { k: "Views", v: "1,280,000" },
  { k: "Spent", v: "$1,934" },
  { k: "Remaining", v: "$566" },
];

const faqs = [
  { q: "How do creators get paid?", a: "Creators receive payment based on verified views." },
  { q: "How are views verified?", a: "During the MVP, our team manually verifies results while API integrations are being developed." },
  { q: "Can companies set their own budget?", a: "Yes — every campaign has its own budget and CPM." },
  { q: "Is there a minimum budget?", a: "No. Companies choose how much they want to spend." },
  { q: "Does AmplyGo charge creators?", a: "No. AmplyGo takes a small fee from successful campaigns." },
  { q: "Can anyone join?", a: "Companies are reviewed before campaigns become public." },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="section-label" style={{ textAlign: "center", marginBottom: 12 }}>{children}</div>;
}

export default function Landing() {
  return (
    <div>
      {/* Textured background */}
      <div className="landing-bg" aria-hidden="true">
        <div className="lb-grid" />
        <div className="beam-l" />
        <div className="beam-r" />
        <div className="lb-glow g1" />
        <div className="lb-glow g2" />
        <div className="lb-glow g3" />
      </div>

      {/* Nav */}
      <div className="landing-nav">
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
            <BrandLogo height={32} />
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Link href="/auth" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: "oklch(90% 0.005 264)" }}>
                Log in
              </Link>
              <Link href="/auth?mode=register" className="btn btn-primary btn-sm glow-primary" style={{ borderRadius: 100 }}>
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero — split: copy left, living campaign mockup right */}
      <div className="hero">
        <div className="hero-spotlight" aria-hidden="true" />
        <div className="hero-inner hero-split" style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 32px 0" }}>
          {/* left copy */}
          <div className="hero-copy" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
            <div className="hero-badge glass" style={{ fontSize: 13, fontWeight: 600, color: "oklch(90% 0.06 330)", padding: "7px 16px", borderRadius: 100 }}>
              <span className="dot" style={{ background: "oklch(72% 0.25 330)", boxShadow: "0 0 10px 1px oklch(72% 0.25 330)" }} />
              The performance marketing platform for creator content
            </div>
            <h1 className="fu fu-1" style={{ fontSize: 58, lineHeight: 1.03, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
              <span className="gradient-text-pink">Performance Marketing</span>, powered by creators.
            </h1>
            <p className="fu fu-2" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--text-dim)", margin: 0, maxWidth: 520 }}>
              Turn organic content into a predictable acquisition channel. Launch campaigns where hundreds of creators
              compete to promote your product — you only pay for verified performance.
            </p>
            <div className="fu fu-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/auth?mode=register&role=company" className="btn btn-primary glow-primary" style={{ borderRadius: 100 }}>
                Get Started
              </Link>
              <Link href="/auth?mode=register&role=creator" className="btn btn-secondary glass" style={{ borderRadius: 100 }}>
                View Campaigns
              </Link>
            </div>
          </div>

          {/* right: living mockup with floating video tiles */}
          <div className="fu fu-3" style={{ position: "relative" }}>
            <div className="hero-float f1 floaty">
              <VideoTile grad={1} views="1.2M" platform="TIKTOK" />
            </div>
            <div className="hero-float f2 floaty" style={{ animationDelay: "1.5s" }}>
              <VideoTile grad={3} views="840K" platform="YOUTUBE_SHORTS" />
            </div>
            <LiveCampaignCard />
          </div>
        </div>
      </div>

      {/* Marquee — creators joining */}
      <div style={{ padding: "48px 0 8px" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dimmer)", marginBottom: 18 }}>
          Creators joining every day from
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {[...Array(2)].flatMap((_, dup) =>
              (["TIKTOK", "INSTAGRAM_REELS", "YOUTUBE_SHORTS"] as const).flatMap((p) =>
                ["@lena.edits", "@mkbrand", "@viral.co", "@studioflow", "@nova.reels", "@dropkick"].map((h) => (
                  <div key={`${dup}-${p}-${h}`} className="marquee-item">
                    <PlatformIcon platform={p} size={16} />
                    {h}
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 32px 8px" }}>
        <div className="resp-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 760, margin: "0 auto" }}>
          {heroStats.map((s) => (
            <div key={s.k} className="glass glass-hi spot-card" style={{ padding: "18px 10px", borderRadius: 14, textAlign: "center" }}>
              <div className="gradient-text-pink" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
                <CountUp to={s.n} startOnView duration={1600} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 2 }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Product showcase (screenshot in a framed panel + glow) */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "96px 32px 40px" }}>
        <Reveal>
          <SectionEyebrow>See it in action</SectionEyebrow>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 40px" }}>
            One dashboard. <span className="gradient-text-pink">Every campaign.</span>
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <ProductShowcase />
        </Reveal>
      </div>

      {/* Traditional is broken */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "96px 32px 40px" }}>
        <Reveal>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 40px" }}>
            Traditional influencer marketing is <span className="gradient-text-pink">broken</span>.
          </h2>
        </Reveal>
        <div className="resp-cmp" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "center" }}>
          <Reveal>
            <div className="glass glass-hi spot-card" style={{ padding: "26px 24px", height: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", marginBottom: 16 }}>
                Traditional
              </div>
              <ul className="compare-list">
                {traditionalCons.map((t) => (
                  <li key={t}><span className="compare-mark" style={{ color: "var(--red)" }}>✕</span>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="vs-chip">VS</div>
          <Reveal delay={120}>
            <div className="glass-strong glass-hi spot-card" style={{ padding: "26px 24px", height: "100%" }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-text)", marginBottom: 16 }}>
                AmplyGo
              </div>
              <ul className="compare-list">
                {amplygoPros.map((t) => (
                  <li key={t}><span className="compare-mark" style={{ color: "var(--green)" }}>✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Vision narrative */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 32px" }}>
        <Reveal>
          <div className="glass-strong glass-hi spot-card" style={{ padding: "40px 40px", textAlign: "center" }}>
            <SectionEyebrow>Imagine launching a campaign</SectionEyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 19, lineHeight: 1.55, fontWeight: 500, color: "oklch(90% 0.01 264)" }}>
              <p style={{ margin: 0 }}>Instead of paying <b>$2,000</b> to one influencer…</p>
              <p style={{ margin: 0 }}>Imagine <span className="gradient-text-pink" style={{ fontWeight: 700 }}>400 creators</span> posting about your product this week.</p>
              <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 16 }}>Some get 2,000 views. Some get 20,000. Some go viral.</p>
              <p style={{ margin: 0 }}>You only pay for the views they <b>actually generate.</b></p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* For Companies */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 32px" }}>
        <Reveal>
          <SectionEyebrow>For Companies</SectionEyebrow>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 40px" }}>
            Turn creators into your <span className="gradient-text-pink">growth engine</span>.
          </h2>
        </Reveal>
        <div className="resp-collapse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          {companyCards.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 100}>
              <div className="glass glass-hi lift spot-card" style={{ padding: "24px 24px", height: "100%" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.5 }}>{c.body}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dashboard mockup */}
        <Reveal delay={100}>
          <div className="glass-strong glass-hi spot-card" style={{ padding: "22px 22px", borderRadius: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Campaign</div>
              <span className="badge badge-sm badge-green">Active</span>
            </div>
            <div className="resp-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {dashboardStats.map((s) => (
                <div key={s.k} className="stat-tile">
                  <div className="k">{s.k}</div>
                  <div className="v">{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="progress-track" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: "77%" }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>$1,934 of $2,500 spent · 77%</div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* For Creators */}
      <div style={{ borderTop: "1px solid var(--card-border)", background: "oklch(100% 0 0 / 0.015)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 32px" }}>
          <Reveal>
            <SectionEyebrow>For Creators</SectionEyebrow>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 8px" }}>
              Stop chasing brands.
            </h2>
            <p style={{ textAlign: "center", fontSize: 18, color: "var(--accent-text)", fontWeight: 600, margin: "0 0 40px" }}>
              Let brands find you.
            </p>
          </Reveal>
          <div className="resp-collapse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {creatorCards.map((c, i) => (
              <Reveal key={c.title} delay={(i % 2) * 100}>
                <div className="glass glass-hi lift spot-card" style={{ padding: "24px 24px", height: "100%" }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.5 }}>{c.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* How it works timeline */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 32px" }}>
        <Reveal>
          <SectionEyebrow>A step-by-step approach</SectionEyebrow>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 44px" }}>
            How it works
          </h2>
        </Reveal>
        <div className="timeline">
          {flow.map((step, i) => (
            <Reveal key={step} delay={i * 80}>
              <div className="tl-item">
                <div className="tl-dot">{i + 1}</div>
                <div style={{ fontSize: 16, fontWeight: 600, paddingTop: 3 }}>{step}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Scale comparison */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 32px 72px" }}>
        <Reveal>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 40px" }}>
            One creator, or an <span className="gradient-text-pink">army</span>?
          </h2>
        </Reveal>
        <div className="resp-cmp" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "stretch" }}>
          <Reveal>
            <div className="glass glass-hi spot-card" style={{ padding: "28px 24px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", marginBottom: 8 }}>Traditional Sponsorship</div>
              <div style={{ fontSize: 15 }}>Company</div>
              <div style={{ color: "var(--text-dimmer)" }}>↓</div>
              <div style={{ fontSize: 15 }}>1 Creator</div>
              <div style={{ color: "var(--text-dimmer)" }}>↓</div>
              <div style={{ fontSize: 15 }}>1 Video</div>
              <div style={{ color: "var(--text-dimmer)" }}>↓</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>50,000 <span style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 500 }}>views</span></div>
            </div>
          </Reveal>
          <div className="vs-chip">VS</div>
          <Reveal delay={120}>
            <div className="glass-strong glass-hi spot-card" style={{ padding: "28px 24px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-text)", marginBottom: 8 }}>AmplyGo</div>
              <div style={{ fontSize: 15 }}>Company</div>
              <div style={{ color: "oklch(66% 0.24 330)" }}>↓</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>245 Creators</div>
              <div style={{ color: "oklch(66% 0.24 330)", letterSpacing: 2 }}>↓↓↓↓↓↓↓↓</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>245 Videos</div>
              <div style={{ color: "oklch(66% 0.24 330)", letterSpacing: 2 }}>↓↓↓↓↓↓↓↓</div>
              <div className="gradient-text-pink" style={{ fontSize: 30, fontWeight: 700 }}>4.8 Million <span style={{ fontSize: 14, WebkitTextFillColor: "var(--text-dim)", fontWeight: 500 }}>views</span></div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* The concept: Google Ads for creator content */}
      <div style={{ borderTop: "1px solid var(--card-border)", background: "oklch(100% 0 0 / 0.015)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 32px" }}>
          <Reveal>
            <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 8px" }}>
              Think Google Ads.
            </h2>
            <p style={{ textAlign: "center", fontSize: 20, color: "var(--accent-text)", fontWeight: 600, margin: "0 0 40px" }}>
              But for creator content.
            </p>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "Google Ads", desc: "Buy traffic", strong: false },
              { name: "Meta Ads", desc: "Buy impressions", strong: false },
              { name: "AmplyGo", desc: "Buy organic attention", strong: true },
            ].map((row, i) => (
              <Reveal key={row.name} delay={i * 90}>
                <div className={`concept-row ${row.strong ? "glass-strong glass-hi" : "glass"}`}>
                  <div className={`concept-name ${row.strong ? "gradient-text-pink" : ""}`}>{row.name}</div>
                  <div className="concept-desc" style={row.strong ? { color: "var(--accent-text)", fontWeight: 600 } : undefined}>
                    {row.desc}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p style={{ textAlign: "center", fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, margin: "32px auto 0", maxWidth: 560 }}>
              Companies don&apos;t hire influencers anymore. They launch campaigns. Creators compete. The best content
              gets rewarded — and companies only pay for verified performance.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Why they love it */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 32px 40px" }}>
        <div className="resp-collapse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Reveal>
            <div className="glass glass-hi spot-card" style={{ padding: "28px 26px", height: "100%" }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Why creators love AmplyGo</div>
              <p style={{ fontSize: 16, fontWeight: 600, fontStyle: "italic", color: "oklch(88% 0.01 264)", margin: "0 0 18px" }}>
                “One viral video can outperform an entire sponsorship.”
              </p>
              <ul className="compare-list">
                {creatorLoves.map((t) => (
                  <li key={t}><span className="compare-mark" style={{ color: "var(--green)" }}>✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="glass glass-hi spot-card" style={{ padding: "28px 26px", height: "100%" }}>
              <div className="section-label" style={{ marginBottom: 18 }}>Why companies love AmplyGo</div>
              <ul className="compare-list">
                {companyLoves.map((t) => (
                  <li key={t}><span className="compare-mark" style={{ color: "var(--green)" }}>✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ borderTop: "1px solid var(--card-border)", background: "oklch(100% 0 0 / 0.015)" }}>
        <div className="resp-collapse" style={{ maxWidth: 1000, margin: "0 auto", padding: "96px 32px", display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: 48, alignItems: "start" }}>
          <Reveal>
            <div style={{ position: "sticky", top: 96 }}>
              <SectionEyebrow>FAQ</SectionEyebrow>
              <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
                Everything you need to know
              </h2>
              <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.6, margin: "0 0 20px" }}>
                Still have questions about how AmplyGo works for companies or creators? We&apos;ve got you.
              </p>
              <Link href="/auth?mode=register" className="btn btn-secondary glass btn-sm" style={{ borderRadius: 100 }}>
                Get started
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div className="faq-body">{f.a}</div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "96px 32px 96px" }}>
        <Reveal>
          <div className="glass-strong glass-hi grad-border" style={{ padding: "60px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, position: "relative", overflow: "hidden" }}>
            <div className="hero-spotlight" aria-hidden="true" style={{ top: -520, opacity: 0.7 }} />
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", margin: 0, position: "relative" }}>
              Ready to <span className="gradient-text-pink">scale with creators</span>?
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", margin: 0, maxWidth: 520, position: "relative" }}>
              Whether you&apos;re looking for customers or looking to earn, AmplyGo makes creator marketing
              performance-driven.
            </p>
            <div style={{ position: "relative" }}>
              <Link href="/auth?mode=register" className="btn btn-primary glow-primary" style={{ borderRadius: 100 }}>
                Get Started
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", color: "var(--text-dimmer)", fontSize: 13, borderTop: "1px solid var(--card-border)" }}>
        <span>AmplyGo — the performance marketing platform for creator content.</span>
        <span style={{ display: "flex", gap: 18 }}>
          <Link href="/privacy" className="nav-link" style={{ color: "var(--text-dim)" }}>Privacy</Link>
          <Link href="/terms" className="nav-link" style={{ color: "var(--text-dim)" }}>Terms</Link>
        </span>
      </div>
    </div>
  );
}
