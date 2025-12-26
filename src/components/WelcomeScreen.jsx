import React, { useState } from 'react';

export function WelcomeScreen({ onStart, isCameraReady, cameraError }) {
    const [mode, setMode] = useState(null); // 'create' | 'join' | null
    const [roomId, setRoomId] = useState('');

    const handleCreate = () => {
        if (!isCameraReady) return;
        onStart('create');
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (roomId.trim() && isCameraReady) {
            onStart('join', roomId);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-retro-cream text-retro-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 font-sans-body selection:bg-retro-gold/30">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

            <div className="relative z-10 max-w-md w-full flex flex-col items-center">
                <div className="mb-8 landscape:mb-4 lg:landscape:mb-8 relative">
                    <div className="absolute -inset-4 bg-retro-gold/20 blur-xl rounded-full opacity-50"></div>
                    <h1 className="relative text-5xl md:text-7xl landscape:text-4xl lg:landscape:text-7xl font-bold tracking-tighter text-retro-black font-serif">
                        RetroBooth
                    </h1>
                </div>

                <p className="text-retro-black/60 mb-12 tracking-[0.2em] uppercase text-xs md:text-sm font-bold">
                    Capture • Create • Collect
                </p>

                {!isCameraReady && !cameraError && (
                    <div className="absolute -top-16 left-0 right-0 flex justify-center">
                        <span className="bg-retro-rust/10 text-retro-rust px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold animate-pulse border border-retro-rust/20">
                            Initializing Camera...
                        </span>
                    </div>
                )}

                {cameraError && (
                    <div className="absolute -top-24 left-0 right-0 flex justify-center px-4">
                        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl text-xs md:text-sm font-bold border border-red-200 shadow-xl max-w-md animate-in slide-in-from-top-2">
                            <div className="uppercase tracking-widest mb-1 text-[10px] text-red-800">Camera Error</div>
                            {cameraError.name === 'NotReadableError' || cameraError.name === 'TrackStartError'
                                ? "Camera is being used by another app. Please close other apps and reload."
                                : "Could not access camera. Please check permissions."}
                            <button onClick={() => window.location.reload()} className="mt-2 block w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-colors">
                                Reload Page
                            </button>
                        </div>
                    </div>
                )}

                {!mode ? (
                    <div className="flex flex-col landscape:flex-row lg:landscape:flex-col gap-4 w-full max-w-xs landscape:max-w-2xl lg:landscape:max-w-xs animate-in slide-in-from-bottom-5 duration-500 delay-100">
                        {/* Solo Mode */}
                        <button
                            onClick={() => onStart('solo')}
                            disabled={!isCameraReady}
                            className="w-full py-4 bg-retro-black text-retro-cream font-bold text-lg rounded-xl hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:scale-100 disabled:cursor-wait font-serif tracking-wide border-2 border-transparent hover:border-retro-gold"
                        >
                            Solo Booth
                        </button>

                        <div className="relative flex items-center py-2 opacity-50 landscape:hidden lg:landscape:flex">
                            <div className="flex-grow border-t border-retro-black/20"></div>
                            <span className="flex-shrink mx-4 text-retro-black/40 text-xs uppercase tracking-widest">Or Duo Mode</span>
                            <div className="flex-grow border-t border-retro-black/20"></div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={!isCameraReady}
                            className="group relative w-full py-4 bg-retro-gold text-retro-black font-bold text-lg rounded-xl hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:scale-100 disabled:cursor-wait"
                        >
                            <span className="relative z-10 w-full flex items-center justify-center gap-1 landscape:justify-between landscape:px-6 landscape:gap-0 lg:landscape:justify-center lg:landscape:px-0 lg:landscape:gap-1">
                                Create Room
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            </span>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            disabled={!isCameraReady}
                            className="w-full py-4 bg-white border-2 border-retro-black/10 text-retro-black font-bold text-lg rounded-xl hover:bg-retro-cream hover:border-retro-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
                        >
                            Join Room
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleJoin} className="flex flex-col gap-4 w-full max-w-xs animate-in slide-in-from-bottom-5 duration-300">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full bg-white border-2 border-retro-black/10 text-retro-black px-6 py-4 rounded-xl focus:outline-none focus:border-retro-gold focus:ring-1 focus:ring-retro-gold transition-all text-center text-lg placeholder:text-retro-black/30 font-serif"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!roomId.trim() || !isCameraReady}
                            className="w-full py-4 bg-retro-rust text-retro-cream font-bold text-lg rounded-xl hover:bg-retro-rust/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                            Connect
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode(null)}
                            className="text-retro-black/50 hover:text-retro-black text-xs uppercase tracking-widest font-bold transition-colors mt-2"
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>

            <div className="absolute bottom-6 text-retro-black/40 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span>Retro Booth</span>
                <span className="w-1 h-1 rounded-full bg-retro-black/40"></span>
                <span>v1.0</span>
            </div>
        </div>
    );
}
