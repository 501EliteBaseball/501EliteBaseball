"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2, X } from "lucide-react";
import ExecutiveRegistrationDetail from "@/components/executive/ExecutiveRegistrationDetail";
import {
  deleteExecutiveRegistration,
  loadCurrentMembership,
  loadExecutiveRegistrations,
  type ExecutiveRegistration,
  type OrganizationMember,
} from "@/lib/executive/executive-service";

export default function ExecutiveRecordView({ registrationId }: { registrationId: string }) {
  const router = useRouter();
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [registration, setRegistration] = useState<ExecutiveRegistration | null>(null);
  const [status, setStatus] = useState("Loading complete registration record…");
  const [error, setError] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadRecord = useCallback(async () => {
    try {
      const currentMembership = await loadCurrentMembership();
      const registrations = await loadExecutiveRegistrations();
      const currentRegistration = registrations.find(
        (item) => item.id === registrationId,
      );

      if (!currentRegistration) {
        throw new Error("This registration record was not found.");
      }

      setMembership(currentMembership);
      setRegistration(currentRegistration);
      setStatus("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The registration record could not be loaded.",
      );
    }
  }, [registrationId]);

  useEffect(() => {
    void Promise.resolve().then(loadRecord);
  }, [loadRecord]);

  async function handleDeleteRegistration() {
    if (!registration || deleting) return;

    try {
      setDeleting(true);
      setDeleteError("");
      await deleteExecutiveRegistration(registration.id);
      router.replace("/executive/records?deleted=1");
      router.refresh();
    } catch (deleteFailure) {
      setDeleteError(
        deleteFailure instanceof Error
          ? deleteFailure.message
          : "The registration could not be deleted.",
      );
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center text-red-700 shadow-lg">
        {error}
      </div>
    );
  }

  if (!membership || !registration) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-lg">
        {status}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/executive/records"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-[#123E74]"
        >
          <ArrowLeft className="h-4 w-4" />
          Registration database
        </Link>

        <button
          type="button"
          onClick={() => {
            setDeleteError("");
            setShowDeleteConfirmation(true);
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
          Delete registration
        </button>
      </div>

      <article className="mt-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D7193F]">
          Complete registration record
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {registration.playerName}
        </h1>
        <p className="mt-2 text-slate-500">
          {registration.familyName} · {registration.parentEmail}
        </p>

        <ExecutiveRegistrationDetail
          registration={registration}
          membership={membership}
        />
      </article>

      {showDeleteConfirmation ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-registration-title"
        >
          <div className="w-full max-w-lg rounded-[30px] border border-red-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <Trash2 className="h-6 w-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={deleting}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close delete confirmation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2
              id="delete-registration-title"
              className="mt-6 text-3xl font-semibold tracking-tight text-slate-950"
            >
              Delete this registration?
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              This permanently removes the registration for <strong>{registration.playerName}</strong>,
              including its registration record and uploaded registration documents. Player and family
              records are removed only when they are no longer connected to another registration.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-900">
              This action cannot be undone. Confirm that you are deleting the duplicate or incorrect record.
            </div>

            {deleteError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={deleting}
                className="min-h-12 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep registration
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteRegistration()}
                disabled={deleting}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-70"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Deleting…" : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
