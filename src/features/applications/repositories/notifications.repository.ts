import { supabaseAdminClient } from "@/lib/supabase/admin-client";

function isMissingColumnError(message?: string) {
  if (!message) return false;
  return message.includes("Could not find") || message.includes("schema cache");
}

export async function insertNotification(input: {
  userId: string;
  projectId: string;
  category: "my-project" | "applied";
  type: string;
  title: string;
  message: string;
  status: string;
  link: string;
}) {
  const { error } = await supabaseAdminClient.from("notifications").insert({
    user_id: input.userId,
    project_id: input.projectId,
    category: input.category,
    event_type: input.type,
    type: input.type,
    title: input.title,
    message: input.message,
    status: input.status,
    link: input.link,
    is_read: false,
  });

  if (error && !isMissingColumnError(error.message)) {
    throw error;
  }
}
