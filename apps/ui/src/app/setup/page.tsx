'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/eden';
import { redirectToSignInIfUnauthorized } from '@/lib/redirectToSignIn';

type FormData = {
  email: string;
  username: string;
  password: string;
  name: string;
  phone: string;
  pfp: File | null;
  plate: string;
  maker: string;
  model: string;
  fuel: 'diesel' | 'gasoline' | 'other' | '';
  fuel_consumption: string;
  drive: 'fwd' | 'rwd' | 'awd' | '';
  displacement: string;
  registration_date: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

type FieldDef = {
  key: keyof FormData;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'date'
    | 'file'
    | 'select';
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  step?: string;
  accept?: string;
  options?: { value: string; label: string }[];
};

type StepDef = { title: string; fields: FieldDef[]; grid?: boolean };

const steps: StepDef[] = [
  {
    title: 'Account',
    fields: [
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'name@company.com',
        maxLength: 254,
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'johndoe',
        maxLength: 64,
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        minLength: 8,
      },
    ],
  },
  {
    title: 'Personal',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'John',
        maxLength: 32,
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'tel',
        required: true,
        placeholder: '+1 234 567 890',
        maxLength: 18,
      },
      {
        key: 'pfp',
        label: 'Profile picture (optional)',
        type: 'file',
        accept: 'image/jpeg,image/png,image/webp',
      },
    ],
  },
  {
    title: 'Vehicle',
    grid: true,
    fields: [
      {
        key: 'plate',
        label: 'Plate',
        type: 'text',
        required: true,
        placeholder: 'ABC 1234',
        maxLength: 32,
      },
      {
        key: 'maker',
        label: 'Maker',
        type: 'text',
        required: true,
        placeholder: 'Mercedes',
        maxLength: 32,
      },
      {
        key: 'model',
        label: 'Model (optional)',
        type: 'text',
        placeholder: '190E',
        maxLength: 32,
      },
      {
        key: 'fuel',
        label: 'Fuel',
        type: 'select',
        required: true,
        options: [
          { value: 'diesel', label: 'Diesel' },
          { value: 'gasoline', label: 'Gasoline' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'drive',
        label: 'Drive',
        type: 'select',
        required: true,
        options: [
          { value: 'fwd', label: 'FWD' },
          { value: 'rwd', label: 'RWD' },
          { value: 'awd', label: 'AWD' },
        ],
      },
      {
        key: 'displacement',
        label: 'Displacement (L)',
        type: 'number',
        required: true,
        step: '0.01',
        placeholder: '2.00',
      },
      {
        key: 'fuel_consumption',
        label: 'Consumption (optional)',
        type: 'number',
        step: '0.01',
        placeholder: '7.50',
      },
      {
        key: 'registration_date',
        label: 'Registration date',
        type: 'date',
        required: true,
      },
    ],
  },
];

const inputClass =
  'rounded-2xl border border-white/12 bg-black/20 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30 focus:bg-black/30';
const labelClass =
  'text-[10px] font-bold text-white/45 uppercase tracking-[0.3em] ml-1';

function validateStep(stepIndex: number, data: FormData): Errors {
  const errors: Errors = {};
  const step = steps[stepIndex];
  if (!step) return errors;
  for (const f of step.fields) {
    const v = data[f.key];
    if (f.required && (v === '' || v === null)) {
      errors[f.key] = 'Required';
    } else if (
      f.type === 'email' &&
      v &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string)
    ) {
      errors[f.key] = 'Invalid email';
    } else if (
      f.minLength &&
      typeof v === 'string' &&
      v.length > 0 &&
      v.length < f.minLength
    ) {
      errors[f.key] = `Minimum ${f.minLength} characters`;
    } else if (
      f.type === 'number' &&
      typeof v === 'string' &&
      v !== '' &&
      Number(v) <= 0
    ) {
      errors[f.key] = 'Must be greater than 0';
    }
  }
  return errors;
}

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldDef;
  value: FormData[keyof FormData];
  onChange: (value: FormData[keyof FormData]) => void;
  error?: string;
}) {
  let input: React.ReactNode;

  if (field.type === 'select') {
    input = (
      <select
        id={field.key}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="" disabled>
          Select
        </option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === 'file') {
    input = (
      <input
        id={field.key}
        type="file"
        accept={field.accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className={`${inputClass} file:mr-3 file:rounded-full file:border file:border-white/15 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-white/80 file:cursor-pointer file:transition-colors hover:file:bg-white/20`}
      />
    );
  } else {
    input = (
      <input
        id={field.key}
        type={field.type}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        minLength={field.minLength}
        step={field.step}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={field.key} className={labelClass}>
        {field.label}
      </label>
      {input}
      {error && (
        <span className="text-[10px] text-red-300 ml-1 mt-0.5">{error}</span>
      )}
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    name: '',
    phone: '',
    pfp: null,
    plate: '',
    maker: '',
    model: '',
    fuel: '',
    fuel_consumption: '',
    drive: '',
    displacement: '',
    registration_date: '',
  });

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function advance() {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep((s) => s - 1);
  }

  async function submit() {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setSubmitting(true);
    setApiError('');

    try {
      const { status, error } = await api.api.setup.post({
        user: {
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          name: formData.name,
          password: formData.password,
        },
        vehicle: {
          plate: formData.plate,
          make: formData.maker,
          model: formData.model || undefined,
          fuel: formData.fuel as 'diesel' | 'gasoline' | 'other',
          fuel_consumption: formData.fuel_consumption || undefined,
          drive: formData.drive as 'fwd' | 'rwd' | 'awd',
          displacement: formData.displacement,
          registration_date: formData.registration_date,
        },
      });

      if (redirectToSignInIfUnauthorized(status)) return;

      if (status === 201) {
        router.push('/');
      } else {
        setApiError(
          typeof error?.value === 'string'
            ? error.value
            : 'Something went wrong',
        );
      }
    } catch {
      setApiError('Connection error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-100 rounded-4xl bg-white/12 backdrop-blur-md border border-white/15 border-t-white/25 border-b-white/5 shadow-2xl overflow-hidden">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 pt-6">
        {steps.map(({ title }, i) => (
          <div key={title} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${i <= step ? 'bg-white/80' : 'bg-white/20'}`}
            />
            {i < steps.length - 1 && (
              <div
                className={`w-6 h-px transition-colors ${i < step ? 'bg-white/60' : 'bg-white/15'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Sliding panels */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {steps.map((s) => (
            <div
              key={s.title}
              className="w-full shrink-0 p-8 flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold text-white tracking-tight">
                {s.title}
              </h2>
              <div
                className={
                  s.grid ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'
                }
              >
                {s.fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={formData[f.key]}
                    onChange={(v) => update(f.key, v as FormData[typeof f.key])}
                    error={errors[f.key]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API error */}
      {apiError && (
        <div className="mx-8 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {apiError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-6 pt-2">
        <button
          type="button"
          onClick={goBack}
          className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-white/30 hover:text-white transition-all ${
            step === 0 ? 'invisible' : ''
          }`}
          aria-label="Previous step"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <span className="text-xs text-white/45">
          {step + 1} / {steps.length}
        </span>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={advance}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white text-slate-950 shadow-lg active:scale-95 transition-all hover:bg-white/90"
            aria-label="Next step"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-full border border-white/20 bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
