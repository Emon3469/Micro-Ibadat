import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-teal-600 placeholder:text-slate-400 focus:ring-2",
        className
      )}
      {...props}
    />
  );
}
