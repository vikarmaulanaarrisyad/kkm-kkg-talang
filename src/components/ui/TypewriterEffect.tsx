"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function TypewriterEffect({ 
  text, 
  words,
  className = "",
  loop = false,
  hideCursor = false
}: { 
  text?: string; 
  words?: string[];
  className?: string;
  loop?: boolean;
  hideCursor?: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const currentText = words && words.length > 0 ? words[wordIndex] : (text || "");

  useEffect(() => {
    if (!currentText) return;

    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, 60); // Typing speed
      } else if (loop || (words && words.length > 1)) {
        timeout = setTimeout(() => setIsDeleting(true), 2000); // Pause before deleting
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length - 1));
        }, 30); // Deleting speed
      } else {
        setIsDeleting(false);
        if (words && words.length > 1) {
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentText, loop, words]);

  return (
    <span className={className}>
      {displayedText}
      {!hideCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="inline-block w-[3px] h-[1em] bg-current ml-[2px] align-text-bottom rounded-full"
        />
      )}
    </span>
  );
}
