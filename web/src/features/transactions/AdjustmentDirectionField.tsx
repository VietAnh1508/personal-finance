export type AdjustmentDirection = 'increase' | 'decrease';

type AdjustmentDirectionFieldProps = {
  name: string;
  value: AdjustmentDirection;
  onChange: (direction: AdjustmentDirection) => void;
};

export function AdjustmentDirectionField({
  name,
  value,
  onChange,
}: AdjustmentDirectionFieldProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm text-slate-200">Direction</legend>
      <div className="flex gap-3">
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
          <input
            checked={value === 'increase'}
            className="accent-amber-300"
            name={name}
            onChange={() => onChange('increase')}
            type="radio"
          />
          Increase
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
          <input
            checked={value === 'decrease'}
            className="accent-amber-300"
            name={name}
            onChange={() => onChange('decrease')}
            type="radio"
          />
          Decrease
        </label>
      </div>
    </fieldset>
  );
}
