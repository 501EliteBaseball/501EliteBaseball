import { NextResponse } from "next/server";
import { deleteRegistration } from "@/lib/executive/delete-registration";
import { requireExecutive } from "@/lib/executive/require-executive";

type Context = { params: Promise<{ id: string }> };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(request: Request, context: Context) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const authorization = await requireExecutive(request);
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "A valid registration ID is required." }, { status: 400 });
  }

  try {
    const result = await deleteRegistration(id, authorization.user.id);
    if (!result) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Executive registration deletion failed", { id, error });
    return NextResponse.json(
      { error: "The registration could not be deleted." },
      { status: 500 },
    );
  }
}
