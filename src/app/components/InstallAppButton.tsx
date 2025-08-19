"use client";
import React, { useEffect, useState } from "react";

interface Props {
  className?: string;
}

// Helper mobile detection
const isMobileUA = () =>
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const InstallAppButton: React.FC<Props> = ({ className = "" }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [ready, setReady] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      (navigator as any).standalone;
    if (standalone) {
      setInstalled(true);
      return;
    }
    setIsIos(
      /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
        !/Android/i.test(navigator.userAgent)
    );

    const beforeHandler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setReady(true);
    };
    const installedHandler = () => {
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", beforeHandler);
    window.addEventListener("appinstalled", installedHandler);

    // Fallback: if event not fired after delay and on iOS or Android, still show button (Android will enable after event)
    const fallbackTimer = setTimeout(() => {
      if (!ready && isMobileUA()) setReady(true); // show disabled button while waiting
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeHandler);
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(fallbackTimer);
    };
  }, [ready]);

  if (!isMobileUA() || installed) return null; // Only mobile pre-install

  const clickInstall = async () => {
    if (isIos && !deferredPrompt) {
      setShowIosHelp(true);
      return;
    }
    if (!deferredPrompt) return; // Not ready yet
    deferredPrompt.prompt();
    const outcome = await deferredPrompt.userChoice;
    if (outcome.outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      <button
        onClick={clickInstall}
        disabled={!deferredPrompt && !isIos}
        className={`px-6 py-3 rounded-md font-semibold shadow transition md:self-start flex items-center justify-center gap-2 ${
          deferredPrompt || isIos
            ? "bg-yellow-400 hover:bg-yellow-300 text-black"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        } ${className}`}>
        {deferredPrompt || isIos ? "Install App" : "Preparing…"}
      </button>
      {showIosHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-md p-5 max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-bold">Add to Home Screen</h3>
            <p className="text-sm text-gray-700">
              On iOS, tap the share button in Safari (square with arrow) then
              choose <strong>Add to Home Screen</strong> to install the app.
            </p>
            <button
              onClick={() => setShowIosHelp(false)}
              className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppButton;
