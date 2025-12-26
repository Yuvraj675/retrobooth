import React, { useState } from 'react';
import { QRCodeModal } from './QRCodeModal';

export function RoomJoin({ peerId, isHost, isConnected }) {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const copyId = () => {
        navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // If Connected: Just show connected badge (or nothing, depending on preference).
    if (isConnected) {
        return (
            <div className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Connected
            </div>
        );
    }

    // If Host (and not connected yet)
    if (isHost) {
        return (
            <>
                <div className="absolute top-6 left-6 z-50 landscape:left-auto landscape:right-6 lg:landscape:left-6 lg:landscape:right-auto flex flex-col gap-2">
                    {/* Show Room Code Button (Primary) */}
                    <button
                        onClick={() => setShowQR(true)}
                        className="group relative flex justify-center items-center gap-2 bg-stone-900/80 backdrop-blur-md border border-stone-700 text-stone-300 px-6 py-3 landscape:px-0 landscape:w-12 landscape:h-12 lg:landscape:w-auto lg:landscape:h-auto lg:landscape:px-6 rounded-full hover:bg-stone-800 hover:text-white hover:border-amber-500/50 transition-all duration-300 shadow-xl"
                        title="Show Room Code"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><rect x="7" y="7" width="3" height="3" /><rect x="14" y="7" width="3" height="3" /><rect x="7" y="14" width="3" height="3" /><path d="M14 14h3v3h-3z" /></svg>
                        <span className="text-xs font-bold uppercase tracking-widest landscape:hidden lg:landscape:inline">
                            Show Room Code
                        </span>
                    </button>
                </div>

                {showQR && <QRCodeModal roomId={peerId} onClose={() => setShowQR(false)} />}
            </>
        );
    }

    // Start/Welcome screen handles guest join. Inside room, guest sees nothing.
    return null;
}
