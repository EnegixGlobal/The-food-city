"use client";

import React, { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const appInstalledHandler = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowFallback(true);
      return;
    }

    if (!deferredPrompt) {
      setShowFallback(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("Install outcome:", outcome);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error(error);
      setShowFallback(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`md:hidden self-center cursor-pointer bg-black border border-yellow-300 rounded-full text-white hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 px-6 py-2 font-bold ${
          !isInstallable && !isIOS ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!isInstallable && !isIOS}
      >
        📲 Install App
      </button>

      <button
        onClick={handleInstallClick}
        className={`hidden cursor-pointer bg-black border border-yellow-300 rounded-full text-white hover:text-white transition-colors duration-300 md:flex items-center gap-2 px-6 py-3 font-bold ${
          !isInstallable && !isIOS ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!isInstallable && !isIOS}
      >
        📲 Install App
      </button>

      {showFallback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Install Our App</h2>
            {isIOS ? (
              <p className="mb-4">
                To install the app on iOS:
                <ol className="list-decimal list-inside">
                  <li>
                    Tap the <strong>Share</strong> button in Safari.
                  </li>
                  <li>
                    Select <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> to complete the installation.
                  </li>
                </ol>
              </p>
            ) : (
              <p className="mb-4">
                Your browser does not support automatic installation. Please
                visit our website on a compatible browser (e.g., Chrome, Edge)
                or add the app manually to your home screen.
              </p>
            )}
            <button
              onClick={() => setShowFallback(false)}
              className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
