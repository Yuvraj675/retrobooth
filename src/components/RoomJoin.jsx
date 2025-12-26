import React, { useState } from 'react';

export function RoomJoin({ peerId, isHost, isConnected }) {
    const [copied, setCopied] = useState(false);

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

    // If Host (and not connected yet, or even if connected? Usually P2P is 1-to-1)
    // Assuming simple room code copying for Host.
    if (isHost) {
        return (
            <div className="absolute top-6 left-6 z-50">
                {/* Copy Button */}
                <button
                    onClick={copyId}
                    className="group relative flex items-center gap-3 bg-stone-900/80 backdrop-blur-md border border-stone-700 text-stone-300 px-6 py-3 rounded-full hover:bg-stone-800 hover:text-white hover:border-amber-500/50 transition-all duration-300 shadow-xl"
                >
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {copied ? 'Code Copied!' : 'Copy Room Code'}
                        </span>
                    </div>
                </button>
            </div>
        );
    }

    // Start/Welcome screen handles guest join. Inside room, guest sees nothing.
    return null;
}
