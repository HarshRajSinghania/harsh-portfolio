import type { Severity } from "@/lib/data";

// Severity is drawn with dither density rather than hue, so it survives
// grayscale, colour-blindness and the amber-only palette.
export const ditherClass: Record<Severity, string> = {
  critical: "dither-full",
  high: "dither-half",
  medium: "dither-sparse",
};
