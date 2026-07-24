"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CompanyNav from "@/components/CompanyNav";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const RULE_OPTIONS = [
  "Show the product for at least 5 seconds",
  "Keep the video published for at least 30 days",
  "Use required hashtags",
  "Include link in bio",
  "No offensive language",
  "No competitor mentions in the same video",
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currency = session?.user?.currency ?? "USD";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("SaaS / Tech");
  const [platform, setPlatform] = useState("TIKTOK");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("Worldwide");
  const [cpm, setCpm] = useState(2);
  const [budget, setBudget] = useState(1000);
  const [maxCreators, setMaxCreators] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rules, setRules] = useState<string[]>(RULE_OPTIONS.slice(0, 2));
  const [rulesExtra, setRulesExtra] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"draft" | "publish" | null>(null);

  const estimatedViews = useMemo(() => {
    if (!cpm || cpm <= 0) return 0;
    return Math.floor((budget / cpm) * 1000);
  }, [cpm, budget]);

  function toggleRule(rule: string) {
    setRules((prev) => (prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]));
  }

  async function submit(publish: boolean) {
    setError(null);
    if (!name.trim() || !description.trim() || !brand.trim()) {
      setError("Please fill in campaign name, description and brand.");
      return;
    }
    setLoading(publish ? "publish" : "draft");
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        brand,
        category,
        platform,
        language,
        country,
        cpm,
        budget,
        maxCreators: maxCreators ? Number(maxCreators) : null,
        endDate: endDate || null,
        rulesChecklist: rules,
        rulesExtra,
        publish,
      }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(`/company/campaigns/${data.campaign.id}`);
  }

  return (
    <CompanyNav title="New campaign">
      <div className="page-narrow">
        {error && <div className="alert-error">{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Basics</div>
          <Field label="Campaign name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Launch" />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Show the product in action, keep it short and native."
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Brand">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Acme Inc." />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {["SaaS / Tech", "App", "Beauty", "Fashion", "Gaming", "Fitness", "Food & Beverage", "Finance", "Video editing", "Consumer product", "Other"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  )
                )}
              </Select>
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Targeting</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Platform">
              <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="TIKTOK">TikTok</option>
                <option value="YOUTUBE_SHORTS">YouTube Shorts</option>
                <option value="INSTAGRAM_REELS">Instagram Reels</option>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Português</option>
                <option>Español</option>
              </Select>
            </Field>
            <Field label="Country">
              <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option>Worldwide</option>
                <option>United States</option>
                <option>Brazil</option>
              </Select>
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Payment</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={`CPM in ${currency} (per 1,000 views)`}>
              <Input type="number" min={0.1} step={0.1} value={cpm} onChange={(e) => setCpm(Number(e.target.value))} />
            </Field>
            <Field label={`Total budget (${currency})`}>
              <Input type="number" min={1} step={1} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </Field>
          </div>
          <div
            style={{
              background: "oklch(72% 0.18 264 / 0.12)",
              border: "1px solid oklch(72% 0.18 264 / 0.25)",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13, color: "oklch(85% 0.1 264)" }}>Estimated max views this budget can pay for</div>
            <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
              {estimatedViews.toLocaleString("en-US")} views
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Rules</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RULE_OPTIONS.map((rule) => (
              <label key={rule} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "oklch(85% 0.005 264)" }}>
                <input type="checkbox" checked={rules.includes(rule)} onChange={() => toggleRule(rule)} />
                {rule}
              </label>
            ))}
          </div>
          <Field label="Additional rules (optional)">
            <Textarea
              rows={3}
              value={rulesExtra}
              onChange={(e) => setRulesExtra(e.target.value)}
              placeholder="Anything else creators must follow — tone, do's and don'ts, brand mentions."
            />
          </Field>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Limits</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Max creators (optional)">
              <Input type="number" min={1} placeholder="No limit" value={maxCreators} onChange={(e) => setMaxCreators(e.target.value)} />
            </Field>
            <Field label="End date">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--card-border)" }}>
          <Button variant="secondary" disabled={!!loading} onClick={() => submit(false)}>
            {loading === "draft" ? "Saving..." : "Save as draft"}
          </Button>
          <Button disabled={!!loading} onClick={() => submit(true)}>
            {loading === "publish" ? "Publishing..." : "Publish campaign"}
          </Button>
        </div>
      </div>
    </CompanyNav>
  );
}
