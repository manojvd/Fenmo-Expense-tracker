import React, { useState, useEffect } from 'react';

const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-slide-down">
            <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-2 flex items-center justify-center gap-2 shadow-lg border-b border-red-400/30">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M1 1l22 22"></path>
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.8"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <path d="M12 20h.01"></path>
                </svg>
                <span className="font-medium">You are currently offline. Some features may be unavailable.</span>
            </div>
        </div>
    );
};

export default OfflineBanner;
