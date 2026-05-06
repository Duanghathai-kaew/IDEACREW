import { NextRequest, NextResponse } from "next/server";

import { createMyProjectStatusNotification } from "@/lib/server/notifications";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Decision = "approve" | "reject";

type Body = {
  decision?: Decision;
  feedback?: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const body = (await request.json()) as Body;
  const decision = body.decision;
  const feedback = (body.feedback ?? "").trim();

  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  if (decision === "reject" && !feedback) {
    return NextResponse.json(
      { error: "Feedback is required for rejection" },
      { status: 400 },
    );
  }

  const nextStatus = decision === "approve" ? "open" : "rejected_by_admin";

  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id,title,owner_id")
    .eq("id", id)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("projects")
    .update({
      status: nextStatus,
      admin_feedback: feedback || null,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await createMyProjectStatusNotification({
    userId: project.owner_id,
    projectId: project.id,
    projectTitle: project.title ?? "Project",
    status: nextStatus,
  });

  if (decision === "reject" && feedback) {
    await supabaseAdmin.from("notifications").insert({
      user_id: project.owner_id,
      project_id: project.id,
      category: "my-project",
      event_type: "project_status_changed",
      title: "ข้อเสนอแนะจากแอดมิน",
      message: feedback,
      status: "rejected_by_admin",
      is_read: false,
    });
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
