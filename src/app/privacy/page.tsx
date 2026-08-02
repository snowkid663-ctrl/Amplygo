import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — AmplyGo",
  description: "How AmplyGo collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 25, 2026">
      <p>
        AmplyGo (&quot;we&quot;, &quot;us&quot;) operates a performance-marketing platform that connects companies with
        creators. This policy explains what we collect, why, and your choices. By using AmplyGo you agree to this policy.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><b>Account data</b> — your name, email address and (for companies) company name and campaign details.</li>
        <li><b>Google sign-in</b> — if you sign in with Google, we receive your name, email and profile picture. We do
          not receive your Google password.</li>
        <li><b>Connected accounts</b> — if you connect a social account (e.g. YouTube), we access read-only channel
          information and the public statistics (views, likes, comments) of the videos you submit to campaigns, so we
          can track campaign performance. We do not post on your behalf.</li>
        <li><b>Usage data</b> — campaigns you join, videos you submit, earnings and basic technical logs.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To operate the platform: run campaigns, track verified views, and calculate creator payouts.</li>
        <li>To authenticate you and keep your account secure.</li>
        <li>To communicate about your account, campaigns and payouts.</li>
      </ul>

      <h2>Google user data</h2>
      <p>
        AmplyGo&apos;s use of information received from Google APIs adheres to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. YouTube data is used solely to display and verify the performance of
        videos you submit to campaigns; it is never sold or used for advertising.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal data. We share it only with service providers that help us run AmplyGo (hosting and
        database infrastructure) and when required by law. Aggregate, non-identifying campaign metrics may be shown to
        the company running a campaign.
      </p>

      <h2>Data retention & your rights</h2>
      <p>
        We keep your data while your account is active. You can request access to, correction of, or deletion of your
        data by contacting us. Deleting your account removes your profile and disconnects any linked social accounts.
      </p>

      <h2>Security</h2>
      <p>
        Passwords are hashed, connections are encrypted in transit (HTTPS), and access is restricted. No system is
        perfectly secure, but we take reasonable measures to protect your information.
      </p>

      <h2>Changes</h2>
      <p>We may update this policy; material changes will be reflected by the &quot;Last updated&quot; date above.</p>
    </LegalPage>
  );
}
