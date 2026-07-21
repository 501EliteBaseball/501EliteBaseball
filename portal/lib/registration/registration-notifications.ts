"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export type RegistrationNotificationEvent = "started" | "completed" | "edited";

export async function notifyExecutivesOfRegistration({
  registrationId,
  event,
  section,
}: {
  registrationId: string;
  event: RegistrationNotificationEvent;
  section?: string;
}) {
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession();

  if (!session?.access_token) return;

  await fetch("/api/registrations/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ registrationId, event, section }),
  });
}
