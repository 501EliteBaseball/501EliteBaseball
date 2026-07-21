"use client";

import { FileCheck2, FileClock, FileUp, LockKeyhole, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import {
  loadBirthCertificates,
  loadRegistrationContext,
  uploadBirthCertificate,
  type RegistrationContext,
  type RegistrationDocument,
} from "@/lib/registration/registration-requirements-service";
import { notifyExecutivesOfRegistration } from "@/lib/registration/registration-notifications";

export default function BirthCertificateUpload() {
  const [context, setContext] = useState<RegistrationContext | null>(null);
  const [documents, setDocuments] = useState<RegistrationDocument[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function initialize() {
      try {
        const registrationContext = await loadRegistrationContext();
        const existing = await loadBirthCertificates(registrationContext.registrationId);
        setContext(registrationContext);
        setDocuments(existing);
      } catch (initializationError) {
        setError(
          initializationError instanceof Error
            ? initializationError.message
            : "Document requirements could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }

    void initialize();
  }, []);

  async function upload() {
    if (!context || !file) {
      setError("Choose a birth certificate file first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      const savedDocument = await uploadBirthCertificate({ context, file });
      const refreshed = await loadBirthCertificates(context.registrationId);
      setDocuments(refreshed.length ? refreshed : [savedDocument, ...documents]);
      setFile(null);
      setSuccess(documents.length ? "Corrected document uploaded. The original was retained." : "Birth certificate uploaded.");
      await notifyExecutivesOfRegistration({
        registrationId: context.registrationId,
        event: "edited",
        section: documents.length ? "corrected document uploaded" : "document uploaded",
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The birth certificate could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <StatusCard text="Loading document requirements…" />;
  if (error && !context) return <StatusCard text={error} error />;

  const current = documents.find((document) => document.status !== "replaced") ?? null;

  return (
    <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#123E74]/10 text-[#123E74]">
          <FileUp className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7193F]">
            Required document
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {context?.playerName}’s birth certificate
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            {current
              ? "Upload a corrected file at any time. Every prior version remains securely retained."
              : "Upload a clear JPG, PNG, or PDF. The maximum file size is 10 MB."}
          </p>
        </div>
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-[#123E74]">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Files are stored privately and are available only to your family and
          specifically authorized executives or administrators.
        </p>
      </div>

      {documents.length ? (
        <section className="mt-7">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#071D39]">
            Document history
          </h2>
          <div className="mt-3 space-y-2">
            {documents.map((document, index) => {
              const isCurrent = document.status !== "replaced";
              return (
                <div key={document.id} className="flex items-center gap-3 rounded-2xl border bg-slate-50 p-4">
                  {isCurrent ? (
                    <FileCheck2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <FileClock className="h-5 w-5 shrink-0 text-slate-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {document.original_filename}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(document.created_at).toLocaleString()} · {isCurrent ? "Current" : `Prior version ${documents.length - index}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <label className="mt-7 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center transition hover:border-[#123E74]">
        <Upload className="mx-auto h-8 w-8 text-[#123E74]" />
        <span className="mt-3 block font-semibold text-slate-800">
          {file ? file.name : current ? "Choose corrected document" : "Choose a file"}
        </span>
        <span className="mt-1 block text-sm text-slate-500">
          JPG, PNG, or PDF · 10 MB maximum
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="sr-only"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setSuccess("");
          }}
        />
      </label>

      {file ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => void upload()}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D7193F] px-6 font-bold text-white disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading
            ? "Uploading securely…"
            : current
              ? "Upload corrected document"
              : "Upload birth certificate"}
        </button>
      ) : null}

      {success ? (
        <p role="status" className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {current ? (
        <a
          href="/registration/success"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#123E74] px-6 font-bold text-white"
        >
          Finish registration
        </a>
      ) : null}
    </div>
  );
}

function StatusCard({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div className={`mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-lg ${
      error ? "border-red-200 text-red-700" : "border-slate-200 text-slate-600"
    }`}>
      {text}
    </div>
  );
}
