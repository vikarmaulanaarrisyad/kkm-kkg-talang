"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function TypewriterEffect({ text, className = "" }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 50); // Kecepatan mengetik
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className="inline-block w-[2px] h-[1.1em] bg-emerald-600 ml-[2px] align-text-bottom"
      />
    </span>
  );
}
