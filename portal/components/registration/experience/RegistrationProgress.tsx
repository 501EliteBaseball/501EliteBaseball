type RegistrationProgressProps = {
  current: number;
  total: number;
  title: string;
  description: string;
};

export default function RegistrationProgress({
  current,
  total,
  title,
  description,
}: RegistrationProgressProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Step {current} of {total}
        </span>

        <span className="text-sm font-semibold text-[#123E74]">
          {percent}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#123E74] to-[#D7193F] transition-all duration-500"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>

      <p className="mt-3 max-w-xl text-lg text-slate-600">
        {description}
      </p>
    </div>
  );
}
