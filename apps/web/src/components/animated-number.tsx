import { cn } from "@caksara/ui/lib/utils";

import { useCountUp } from "../lib/use-count-up";

/** Tampilkan angka dengan animasi count-up. Hanya ganti render angka. */
export function AnimatedNumber({
  value,
  prefix,
  suffix,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const display = useCountUp(value);
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
