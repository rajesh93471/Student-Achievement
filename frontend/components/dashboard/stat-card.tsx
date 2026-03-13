export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="card p-6">
      <p className="text-sm text-slate">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm text-slate">{helper}</p>
    </div>
  );
}
