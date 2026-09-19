"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

// Honour the OS "reduce motion" setting across every framer-motion animation.
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
