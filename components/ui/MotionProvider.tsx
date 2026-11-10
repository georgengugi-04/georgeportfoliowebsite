"use client";

import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";

// Makes every framer-motion animation respect the visitor's reduced-motion setting.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
