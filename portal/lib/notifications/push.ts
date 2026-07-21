import webpush from "web-push";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type PushMessage = { title: string; body: string; url?: string };
type PushOptions = { audience?: "all" | "executives" };

export async function sendPushNotification(
  message: PushMessage,
  options: PushOptions = {},
) {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) return;

  webpush.setVapidDetails(
    "mailto:admin@501elitebaseball.com",
    "BJhWPgWNbi-Ib2CquTUb5jCFxLob5Gc_b3HVGmZiggeNshHeAx9QMZS08Ojj4MXU8qdZATPmYv4E3assWrgMRYg",
    privateKey,
  );

  const admin = createSupabaseAdmin();
  let executiveIds: string[] | null = null;

  if (options.audience === "executives") {
    const { data: members } = await admin
      .from("organization_members")
      .select("user_id")
      .eq("active", true)
      .in("role", ["executive", "admin"]);
    executiveIds = (members ?? []).map((member) => member.user_id);
    if (!executiveIds.length) return;
  }

  let query = admin
    .from("push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth")
    .eq("active", true);

  if (executiveIds) {
    query = query.in("user_id", executiveIds);
  }

  const { data } = await query;

  await Promise.allSettled(
    (data ?? []).map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(message),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin
            .from("push_subscriptions")
            .update({ active: false })
            .eq("id", subscription.id);
        }
      }
    }),
  );
}
