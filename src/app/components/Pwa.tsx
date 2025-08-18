"use client";
import { useEffect } from "react";

const Pwa = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js");
          // console.log("Service Worker registered", reg.scope);
        } catch (e) {
          console.warn("SW registration failed", e);
        }
      };
      register();
    }

    // Optional: handle beforeinstallprompt for custom install UI (if needed later)
    const handler = (e: any) => {
      e.preventDefault();
      // You can store event and show a custom install button
      // window.deferredPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null;
};

export default Pwa;
