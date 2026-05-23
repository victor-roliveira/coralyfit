import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <label
      className={cn(
        "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-slate-200 transition-colors has-[:checked]:bg-[#C9BEFF] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className
      )}
    >
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </label>
  )
);
Switch.displayName = "Switch";

export { Switch };
