// Tells TypeScript that window.google exists after the Maps script loads.
// We load Maps via a plain <script> tag so there is no npm package to import.
declare global {
  interface Window {
    google: typeof google;
  }
}

export {};