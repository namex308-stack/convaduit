"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Top-of-page reading progress bar. Split from visual-effects to keep homepage JS small. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] gradient-brand origin-left rtl:origin-right z-[60]"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
