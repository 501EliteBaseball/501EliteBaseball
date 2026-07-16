import type { ExecutiveRegistration } from "@/lib/executive/executive-service";

export type RegistrationFilter =
  | "all"
  | "draft"
  | "submitted"
  | "approved"
  | "missing-documents"
  | "missing-releases"
  | "duplicates";

export function duplicateRegistrationIds(registrations: ExecutiveRegistration[]) {
  const groups = new Map<string, string[]>();
  for (const registration of registrations) {
    const key = [
      registration.parentEmail,
      registration.player.first_name,
      registration.player.last_name,
      registration.dateOfBirth,
    ]
      .map((value) => value.trim().toLocaleLowerCase())
      .join("|");
    if (key.includes("not provided") || key.split("|").some((value) => !value)) continue;
    groups.set(key, [...(groups.get(key) ?? []), registration.id]);
  }
  return new Set([...groups.values()].filter((ids) => ids.length > 1).flat());
}

export function registrationMatches(
  registration: ExecutiveRegistration,
  search: string,
  filter: RegistrationFilter,
  duplicateIds: Set<string>,
) {
  const extendedRegistration = registration as ExecutiveRegistration & {
    team?: string;
    teamName?: string;
  };
  const query = search.trim().toLocaleLowerCase();
  const searchable = [
    registration.playerName,
    registration.parentName,
    registration.parentEmail,
    registration.familyName,
    registration.season,
    registration.status,
    extendedRegistration.team,
    extendedRegistration.teamName,
    registration.player.school,
  ]
    .join(" ")
    .toLocaleLowerCase();

  if (query && !searchable.includes(query)) return false;
  if (filter === "all") return true;
  if (["draft", "submitted", "approved"].includes(filter)) {
    return registration.status.toLocaleLowerCase() === filter;
  }
  if (filter === "missing-documents") {
    return registration.birthCertificateStatus === "missing";
  }
  if (filter === "missing-releases") return registration.releaseCount < 6;
  return duplicateIds.has(registration.id);
}
