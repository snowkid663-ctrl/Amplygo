"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CompanyNav from "@/components/CompanyNav";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import MultiSelect from "@/components/ui/MultiSelect";
import { PLATFORM_LABEL } from "@/lib/types";

const RULE_OPTIONS = [
  "Show the product for at least 5 seconds",
  "Keep the video published for at least 30 days",
  "Use required hashtags",
  "Include link in bio",
  "No offensive language",
  "No competitor mentions in the same video",
];

const PLATFORM_OPTIONS = (["TIKTOK", "YOUTUBE_SHORTS", "INSTAGRAM_REELS"] as const).map((v) => ({ value: v, label: PLATFORM_LABEL[v] }));

const LANGUAGES = [
  "English", "Português", "Español", "Français", "Deutsch", "Italiano", "Nederlands",
  "Русский", "中文", "日本語", "한국어", "हिन्दी", "العربية", "Türkçe", "Polski", "Bahasa Indonesia",
].map((l) => ({ value: l, label: l }));

const COUNTRIES = [
  "Worldwide", "United States", "Brazil", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Spain", "Portugal", "Italy", "Netherlands", "Mexico", "Argentina", "Colombia",
  "India", "Japan", "South Korea", "China", "Indonesia", "Philippines", "Turkey", "Poland",
  "Sweden", "Norway", "Ireland", "United Arab Emirates", "Saudi Arabia", "South Africa", "Nigeria",
].map((c) => ({ value: c, label: c }));

type Media = { url: string; type: "image" | "video" | "gif" };
type Attachment = { url: string; name: string };

export default function NewCampaignPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currency = session?.user?.currency ?? "USD";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("SaaS / Tech");
  const [platforms, setPlatforms] = useState<string[]>(["TIKTOK"]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [countries, setCountries] = useState<string[]>(["Worldwide"]);
  const [cpm, setCpm] = useState(2);
  const [budget, setBudget] = useState(1000);
  const [maxCreators, setMaxCreators] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rulesMode, setRulesMode] = useState<"list" | "write">("list");
  const [rules, setRules] = useState<string[]>(RULE_OPTIONS.slice(0, 2));
  const [rulesExtra, setRulesExtra] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState<"media" | "file" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"draft" | "publish" | null>(null);
  const mediaInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const estimatedViews = useMemo(() => {
    if (!cpm || cpm <= 0) return 0;
    return Math.floor((budget / cpm) * 1000);
  }, [cpm, budget]);

  function toggleRule(rule: string) {
    setRules((prev) => (prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]));
  }

  async function upload(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Upload failed");
      return null;
    }
    return (await res.json()).url as string;
  }

  async function addMedia(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading("media");
    for (const f of Array.from(files).slice(0, 12)) {
      const url = await upload(f);
      if (url) {
        const type: Media["type"] = f.type === "image/gif" ? "gif" : f.type.startsWith("video") ? "video" : "image";
        setMedia((m) => [...m, { url, type }]);
      }
    }
    setUploading(null);
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading("file");
    for (const f of Array.from(files).slice(0, 12)) {
      const url = await upload(f);
      if (url) setAttachments((a) => [...a, { url, name: f.name }]);
    }
    setUploading(null);
  }

  async function submit(publish: boolean) {
    setError(null);
    if (!name.trim() || !description.trim() || !brand.trim()) {
      setError("Please fill in campaign name, description and brand.");
      return;
    }
    if (platforms.length === 0) {
      setError("Pick at least one platform.");
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
        platforms,
        languages,
        countries,
        cpm,
        budget,
        maxCreators: maxCreators ? Number(maxCreators) : null,
        endDate: endDate || null,
        rulesChecklist: rulesMode === "list" ? rules : [],
        rulesExtra,
        productMedia: media,
        attachments,
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
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Show the product in action, keep it short and native." />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Brand">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Acme Inc." />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {["SaaS / Tech", "App", "Beauty", "Fashion", "Gaming", "Fitness", "Food & Beverage", "Finance", "Video editing", "Consumer product", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {/* Product assets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Product media & files</div>
          <input ref={mediaInput} type="file" accept="image/*,video/*" hidden multiple onChange={(e) => addMedia(e.target.files)} />
          <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip" hidden multiple onChange={(e) => addFiles(e.target.files)} />
          <div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Images, GIFs or videos of your product (helps creators)</div>
            <div className="asset-grid">
              {media.map((m, i) => (
                <div key={i} className="asset-tile" style={m.type !== "video" ? { backgroundImage: `url(${m.url})` } : undefined}>
                  {m.type === "video" && "🎬"}
                  <button type="button" className="asset-x" onClick={() => setMedia((x) => x.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              <button type="button" className="asset-add" onClick={() => mediaInput.current?.click()} disabled={uploading === "media"}>
                {uploading === "media" ? "…" : <><span style={{ fontSize: 20 }}>+</span>Add media</>}
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>Attach briefs / assets (PDF, DOC, XLS, TXT, ZIP)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attachments.map((a, i) => (
                <div key={i} className="file-row">
                  <span>📎</span>
                  <a href={a.url} target="_blank" rel="noreferrer" style={{ color: "var(--text)", textDecoration: "none" }}>{a.name}</a>
                  <button type="button" className="x" onClick={() => setAttachments((x) => x.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              <Button type="button" small variant="secondary" onClick={() => fileInput.current?.click()} disabled={uploading === "file"}>
                {uploading === "file" ? "Uploading…" : "+ Attach file"}
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-label">Targeting</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="resp-collapse">
            <Field label="Platforms">
              <MultiSelect options={PLATFORM_OPTIONS} selected={platforms} onChange={setPlatforms} placeholder="Pick platforms" />
            </Field>
            <Field label="Languages">
              <MultiSelect options={LANGUAGES} selected={languages} onChange={setLanguages} placeholder="Pick languages" searchable />
            </Field>
            <Field label="Countries">
              <MultiSelect options={COUNTRIES} selected={countries} onChange={setCountries} placeholder="Pick countries" searchable />
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
          <div style={{ background: "oklch(72% 0.18 264 / 0.12)", border: "1px solid oklch(72% 0.18 264 / 0.25)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "oklch(85% 0.1 264)" }}>Estimated max views this budget can pay for</div>
            <div className="tabular" style={{ fontSize: 18, fontWeight: 700, color: "white" }}>{estimatedViews.toLocaleString("en-US")} views</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div className="section-label" style={{ margin: 0 }}>Rules</div>
            <div className="seg">
              <button type="button" className={rulesMode === "list" ? "on" : ""} onClick={() => setRulesMode("list")}>Checklist</button>
              <button type="button" className={rulesMode === "write" ? "on" : ""} onClick={() => setRulesMode("write")}>Write</button>
            </div>
          </div>
          {rulesMode === "list" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {RULE_OPTIONS.map((rule) => (
                  <label key={rule} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "oklch(85% 0.005 264)" }}>
                    <input type="checkbox" checked={rules.includes(rule)} onChange={() => toggleRule(rule)} />
                    {rule}
                  </label>
                ))}
              </div>
              <Field label="Additional rules (optional)">
                <Textarea rows={3} value={rulesExtra} onChange={(e) => setRulesExtra(e.target.value)} placeholder="Anything else creators must follow — tone, do's and don'ts, brand mentions." />
              </Field>
            </>
          ) : (
            <Field label="Write your rules">
              <Textarea rows={6} value={rulesExtra} onChange={(e) => setRulesExtra(e.target.value)} placeholder={"Describe what creators must do, in your own words.\n\ne.g. Show the product in the first 3 seconds, keep it up 30 days, use #brand, no competitor mentions."} />
            </Field>
          )}
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
