"use client";

import { useEffect } from "react";
import { SITE_CONFIG } from "@/lib/tools";

const ADSENSE_SCRIPT_ID = "adsbygoogle-init";
const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adsenseClient}`;

export function AdSenseScript() {
  useEffect(() => {
    const alreadyLoaded = [...document.scripts].some(
      (script) => script.src === ADSENSE_SCRIPT_SRC,
    );
    if (alreadyLoaded) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = ADSENSE_SCRIPT_SRC;
    document.head.appendChild(script);
  }, []);

  return null;
}
