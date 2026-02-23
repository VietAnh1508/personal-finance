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
      <legend className="pf-label">Direction</legend>
      <div className="flex gap-3">
        <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--pf-border-soft)] bg-[var(--pf-input-bg)] px-3 py-2 text-sm">
          <input
            checked={value === 'increase'}
            className="pf-checkbox"
            name={name}
            onChange={() => onChange('increase')}
            type="radio"
          />
          Increase
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--pf-border-soft)] bg-[var(--pf-input-bg)] px-3 py-2 text-sm">
          <input
            checked={value === 'decrease'}
            className="pf-checkbox"
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
