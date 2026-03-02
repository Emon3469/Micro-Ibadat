import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-teal-700 px-4 py-2 text-white hover:bg-teal-800",
        secondary: "border border-base-300 bg-base-200 px-4 py-2 text-base-content hover:bg-base-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Button({ className, variant, ...props }) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
