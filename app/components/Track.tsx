"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Beacon de analítica → XiraX OS. Liviano, fail-soft, sin datos personales.
const SITE = "web";
const ENDPOINT = "https://os.xiraxai.com/api/track";

export function Track() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has("soy_yo")) document.cookie = "xirax_internal=1;max-age=31536000;path=/";
      const internal = document.cookie.includes("xirax_internal=1");
      let sid = localStorage.getItem("xirax_sid");
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("xirax_sid", sid);
      }
      const body = JSON.stringify({ site: SITE, path: pathname, type: "view", sessionId: sid, internal, ref: document.referrer });
      if (navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, body);
      else fetch(ENDPOINT, { method: "POST", body, keepalive: true });
    } catch {
      // nunca rompe la página
    }
  }, [pathname]);
  return null;
}
