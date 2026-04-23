import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

/** Consistent label + field + error/hint wrapper */
export function FormField({ label, required, optional, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-[11px] font-normal text-slate-400">(tuỳ chọn)</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
          <span className="shrink-0">⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

/** Base input style — apply to <input> and <select> via className merge */
export const inputClass = cn(
  "w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-[13px] text-slate-700",
  "focus:outline-none focus:border-primary transition-colors duration-150 placeholder:text-slate-300"
);
