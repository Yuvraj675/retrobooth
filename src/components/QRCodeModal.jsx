import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRCodeModal({ roomId, onClose }) {
    const url = `https://retrobooth.netlify.app/?room=${roomId}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in p-4" onClick={onClose}>
            <div
                className="bg-retro-cream p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300 border-4 border-retro-gold"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-2xl font-serif-display text-retro-black">Join Room</h3>

                <div className="bg-white p-4 rounded-xl shadow-inner">
                    <QRCodeSVG value={url} size={200} level="H" fgColor="#1a2e1a" />
                </div>

                <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-retro-black/60 uppercase tracking-widest">Room Code</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-3xl font-mono font-bold text-retro-rust tracking-wider selection:bg-retro-gold/30">{roomId}</p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(roomId);
                                const btn = document.getElementById('copy-modal-text');
                                if (btn) btn.innerText = 'COPIED!';
                                setTimeout(() => { if (btn) btn.innerText = 'COPY'; }, 2000);
                            }}
                            className="bg-retro-black/5 hover:bg-retro-black/10 text-retro-black px-2 py-1 rounded-lg transition-colors border border-retro-black/10"
                            title="Copy Code"
                        >
                            <span id="copy-modal-text" className="text-[10px] font-bold uppercase tracking-widest block min-w-[30px]">COPY</span>
                        </button>
                    </div>
                </div>

                <p className="text-xs text-center text-retro-black/50 px-4">
                    Scan with your phone camera or share this code to invite a guest.
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-retro-black text-retro-cream rounded-xl font-bold hover:bg-retro-black/80 transition-colors uppercase tracking-widest text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
