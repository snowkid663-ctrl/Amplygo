import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — AmplyGo",
  description: "The terms that govern your use of AmplyGo.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 25, 2026">
      <p>
        These Terms govern your use of AmplyGo. By creating an account or using the platform, you agree to them. If you
        do not agree, do not use AmplyGo.
      </p>

      <h2>The service</h2>
      <p>
        AmplyGo is a performance-marketing platform where companies launch campaigns and creators promote products in
        exchange for pay based on verified views. AmplyGo facilitates these campaigns and takes a service fee from
        successful ones.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep your credentials secure.</li>
        <li>You are responsible for activity under your account.</li>
        <li>Companies may be reviewed before their campaigns become public.</li>
      </ul>

      <h2>Creators &amp; payments</h2>
      <ul>
        <li>Creators earn based on verified views of content submitted to a campaign, at the campaign&apos;s CPM.</li>
        <li>Submissions must follow the campaign&apos;s rules and applicable platform policies.</li>
        <li>Payouts are subject to verification; fraudulent or artificially inflated metrics may void earnings.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the platform, including posting unlawful content, infringing others&apos; rights,
        attempting to manipulate metrics, or interfering with the service.
      </p>

      <h2>Disclaimers</h2>
      <p>
        AmplyGo is provided &quot;as is&quot; during its MVP stage. We do not guarantee specific results, uninterrupted
        availability, or the accuracy of third-party (e.g. platform) data. To the extent permitted by law, we are not
        liable for indirect or consequential damages.
      </p>

      <h2>Termination</h2>
      <p>We may suspend or terminate accounts that violate these Terms. You may stop using AmplyGo at any time.</p>

      <h2>Changes</h2>
      <p>We may update these Terms; continued use after changes means you accept them.</p>
    </LegalPage>
  );
}
