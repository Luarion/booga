const inputClass =
  'rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-purple-500/50 focus:bg-black/40 focus:ring-4 focus:ring-purple-500/20';

const labelClass =
  'ml-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white/45';

type FieldOption = { value: string; label: string };

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
} & (
  | {
      type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date';
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      autoComplete?: string;
      required?: boolean;
      disabled?: boolean;
      minLength?: number;
      maxLength?: number;
      step?: string;
    }
  | {
      type: 'select';
      value: string;
      onChange: (value: string) => void;
      options: FieldOption[];
      required?: boolean;
      disabled?: boolean;
    }
  | {
      type: 'file';
      onChange: (file: File | null) => void;
      accept?: string;
      disabled?: boolean;
    }
);

/**
 * Unified form field with label, input, and optional error.
 *
 * Supports text-like inputs, selects, and file inputs. Consolidates
 * `UserField` (page.tsx), `FieldInput` (setup), and the inline inputs
 * in sign-in / sign-up pages.
 */
export function FormField(props: FormFieldProps) {
  const { id, label, type, error } = props;

  let input: React.ReactNode;

  if (type === 'select') {
    const { value, onChange, options, required, disabled } = props;
    input = (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={inputClass}
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'file') {
    const { onChange, accept, disabled } = props;
    input = (
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className={`${inputClass} file:mr-3 file:rounded-full file:border file:border-white/15 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-white/80 file:cursor-pointer file:transition-colors hover:file:bg-white/20`}
      />
    );
  } else {
    const {
      value,
      onChange,
      placeholder,
      autoComplete,
      required,
      disabled,
      minLength,
      maxLength,
      step,
    } = props;
    input = (
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        step={step}
        className={inputClass}
      />
    );
  }

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {input}
      {error && (
        <span className="ml-1 mt-0.5 text-[10px] text-red-300">{error}</span>
      )}
    </label>
  );
}
