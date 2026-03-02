import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none ring-teal-600 placeholder:text-base-content/60 focus:ring-2",
        className
      )}
      {...props}
    />
  );
}
