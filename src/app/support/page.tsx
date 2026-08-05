import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Support — AmplyGo",
  description: "Get help with AmplyGo.",
};

export default function SupportPage() {
  return (
    <LegalPage title="Support" updated="July 25, 2026">
      <p>Need a hand? We&apos;re happy to help companies and creators using AmplyGo.</p>

      <h2>Contact us</h2>
      <p>
        Email <a href="mailto:support@amplygo.com">support@amplygo.com</a> and we&apos;ll get back to you as soon as we
        can. Please include your account email and, if it&apos;s about a campaign, the campaign name.
      </p>

      <h2>Common questions</h2>
      <ul>
        <li><b>How do creators get paid?</b> Based on verified views of the videos you submit to a campaign, at the campaign&apos;s CPM.</li>
        <li><b>How are views tracked?</b> For YouTube we read public view/like/comment counts directly from the platform; other platforms are being added.</li>
        <li><b>I can&apos;t connect my account.</b> Make sure it&apos;s the account you post from and that it&apos;s public, then try again from Settings → Connected accounts.</li>
        <li><b>Payouts.</b> Request a payout from the Earnings page once you reach the minimum; we process it to your chosen method.</li>
      </ul>

      <h2>Report a problem</h2>
      <p>Found a bug or something that looks off in a campaign&apos;s numbers? Email us with a screenshot and we&apos;ll investigate.</p>
    </LegalPage>
  );
}
