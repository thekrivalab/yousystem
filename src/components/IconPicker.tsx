"use client";

type IconPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  helperText?: string;
};

export function IconPicker({ label, value, onChange, options, helperText }: IconPickerProps) {
  const visibleOptions = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="ui-label">{label}</label>
        {helperText && <p className="text-[11px] text-[var(--fg-subtle)]">{helperText}</p>}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {visibleOptions.map((option) => {
          const selected = option === value;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`h-11 rounded-xl border text-xl transition-all hover:-translate-y-0.5 sm:h-12 ${
                selected
                  ? 'border-[var(--fg-base)] bg-[var(--bg-elevated)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--fg-muted)]'
              }`}
              aria-pressed={selected}
              aria-label={`Selecionar ícone ${option}`}
              title={`Selecionar ${option}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
