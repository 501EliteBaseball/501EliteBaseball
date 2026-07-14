type RegistrationStatusProps = {
  loading: boolean;
  autosaveText: string;
  error: string | null;
};

export default function RegistrationStatus({
  loading,
  autosaveText,
  error,
}: RegistrationStatusProps) {
  return (
    <>
      <div className="flex items-center justify-end">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {loading ? "Loading..." : autosaveText}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </>
  );
}
