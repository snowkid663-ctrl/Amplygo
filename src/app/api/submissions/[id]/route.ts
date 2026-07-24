import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSubmissionById, approveSubmission, rejectSubmission } from "@/lib/data";

// Admin review queue. viewsCount is entered manually in the MVP - this is
// the stand-in for automatic API tracking (see README "Phase 2").
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const submission = getSubmissionById(params.id);
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (submission.status !== "PENDING" && submission.status !== "FLAGGED") {
    return NextResponse.json({ error: "This submission has already been reviewed." }, { status: 400 });
  }

  const { action, viewsCount, note } = (await req.json().catch(() => ({}))) as {
    action: "approve" | "reject";
    viewsCount?: number;
    note?: string;
  };

  if (action === "approve") {
    if (!viewsCount || viewsCount < 0) {
      return NextResponse.json({ error: "Enter a valid view count to approve." }, { status: 400 });
    }
    const updated = approveSubmission(submission.id, Math.round(viewsCount), note);
    return NextResponse.json({ submission: updated });
  }
  if (action === "reject") {
    const updated = rejectSubmission(submission.id, note);
    return NextResponse.json({ submission: updated });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
