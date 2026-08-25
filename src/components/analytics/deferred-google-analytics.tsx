import Script from "next/script";

const GA_ID = "G-MDR2NP5CJ3";

/**
 * Loads gtag after `window.load` so it is not preloaded as a render-blocking
 * script. Same config as `@next/third-parties/google` GoogleAnalytics.
 */
export function DeferredGoogleAnalytics() {
  return (
    <>
      <Script id="ga-init" strategy="lazyOnload">{`
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
`}</Script>
      <Script
        id="ga-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
    </>
  );
}
