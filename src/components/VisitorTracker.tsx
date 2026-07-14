"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    // Track once per session using sessionStorage
    const tracked = sessionStorage.getItem("visitor_tracked");
    if (!tracked) {
      fetch("/api/visitors", { method: "POST" })
        .then(() => {
          sessionStorage.setItem("visitor_tracked", "1");
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
