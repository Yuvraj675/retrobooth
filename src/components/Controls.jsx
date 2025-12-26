import React from 'react';
import { FILTERS, FRAMES } from '../utils/constants';

export function Controls({
    isCapturing,
    onCapture,
    activeFilter,
    onFilterChange,
    activeFrame,
    onFrameChange,
    role,
    isReady,
    onReadyChange,
    remoteReady,
    onOpenGallery,
    flashEnabled,
    onFlashToggle,
    isConnected
}) {
    // GUEST VIEW: minimalistic, only Ready toggle
    if (role === 'guest') {
        return (
            <div className="w-full flex items-center justify-center py-8 relative">
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={() => onReadyChange(!isReady)}
                        className={`
                            relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                            border-4 ${isReady ? 'border-retro-gold bg-retro-cream' : 'border-retro-black/10 bg-retro-black/5'}
                        `}
                    >
                        <div className={`
                            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                            ${isReady ? 'bg-green-600 shadow-[0_0_30px_rgba(22,163,74,0.4)]' : 'bg-retro-black/20 hover:bg-retro-black/30'}
                        `}>
                            {isReady ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-widest text-retro-black/60">Ready?</span>
                            )}
                        </div>
                    </button>
                    <span className="text-sm font-serif-display text-retro-black/80 font-bold tracking-wider">
                        {isReady ? 'WAITING FOR HOST' : 'NOT READY'}
                    </span>

                    {/* Guest Gallery Button */}
                    <div className="flex flex-col items-center gap-2 group cursor-pointer absolute right-4 md:-right-20 top-1/2 -translate-y-1/2" onClick={onOpenGallery}>
                        <div className="w-10 h-10 rounded-2xl border-2 border-retro-black/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-retro-black/70 group-hover:bg-retro-gold/20 group-hover:border-retro-gold group-hover:text-retro-black transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                        <span className="text-[10px] font-serif-display text-retro-black/80 font-bold uppercase tracking-wider">Gallery</span>
                    </div>
                </div>
            </div>
        );
    }

    // HOST VIEW: Full Controls
    return (
        <div className="w-full flex items-center justify-between px-4 sm:px-12 py-6">

            {/* Left Options (Flash, Filter) */}
            <div className="flex gap-6 items-center w-1/3 justify-start">
                <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onFlashToggle}>
                    <div className={`w-12 h-12 rounded-2xl border-2 transition-all shadow-sm flex items-center justify-center 
                        ${flashEnabled
                            ? 'border-retro-gold bg-retro-gold/10 text-retro-black'
                            : 'border-retro-black/10 bg-white/50 text-retro-black/40'
                        }
                    `}>
                        {flashEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 6.91L18.5 6.55L12 10.33V22L9 22V12.1L3.9 15.06L3.4 14.7L13 9.1L4 4.1L4.5 3.73L11 8.9V2L14 2V8.3L19.1 5.34L19.6 5.7L10 11.3L19 16.3L18.5 16.66L12 11.5Z" opacity="0.2" /><path d="M3 3l18 18"></path><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" style={{ opacity: 0.2 }}></polygon></svg>
                            // Simple crossed flash for off
                        )}
                        {!flashEnabled && <svg className="absolute w-6 h-6 text-retro-black/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line></svg>}
                    </div>
                    <span className="text-xs font-serif-display text-retro-black/80 font-bold uppercase tracking-wider">{flashEnabled ? 'On' : 'Off'}</span>
                </div>

                {/* Filter Cycler */}
                <div className="w-20 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => {
                    const idx = FILTERS.findIndex(f => f.id === activeFilter.id);
                    const next = FILTERS[(idx + 1) % FILTERS.length];
                    onFilterChange(next);
                }}>
                    <div className="w-12 h-12 rounded-2xl border-2 border-retro-black/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-retro-black/70 group-hover:bg-retro-gold/20 group-hover:border-retro-gold group-hover:text-retro-black transition-all shadow-sm relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="10" cy="10" r="3"></circle><line x1="21" y1="21" x2="15" y2="15"></line></svg>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-retro-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-retro-rust"></span>
                        </span>
                    </div>
                    <div className="w-full flex flex-col items-center leading-none mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-retro-black/80">Filter</span>
                        <span className="text-[9px] font-sans-body text-retro-black/60 uppercase tracking-widest truncate max-w-full text-center">{activeFilter.name}</span>
                    </div>
                </div>
            </div>

            {/* Center Shutter */}
            <div className="relative w-1/3 flex justify-center -mt-8"> {/* Lift shutter slightly */}
                <button
                    onClick={() => !isCapturing && ((role === 'host' || role === 'solo') ? onCapture(true) : null)}
                    disabled={isCapturing || (role !== 'host' && role !== 'solo') || (role === 'host' && isConnected && !remoteReady)}
                    className={`
                        w-28 h-28 rounded-full flex items-center justify-center transition-all bg-retro-cream 
                        shadow-[0_10px_40px_-10px_rgba(192,88,50,0.5)] border-8 border-retro-cream z-20 group
                        ${((role === 'host' && (!isConnected || remoteReady)) || role === 'solo')
                            ? 'hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[0_20px_60px_-15px_rgba(192,88,50,0.6)]'
                            : 'opacity-50 cursor-not-allowed grayscale'
                        }
                    `}
                >
                    <div className="w-full h-full rounded-full bg-retro-rust flex items-center justify-center text-white shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] border-4 border-white/10">
                        {isCapturing ? (
                            <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 group-hover:scale-110 transition-transform"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        )}
                    </div>
                </button>

                {/* Remote Ready Status Indicator for Host */}
                {
                    role === 'host' && remoteReady === false && isConnected && (
                        <div className="absolute -bottom-10 whitespace-nowrap px-3 py-1 bg-retro-rust/10 text-retro-rust text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse border border-retro-rust/20">
                            Partner Not Ready
                        </div>
                    )
                }
                {
                    role === 'host' && remoteReady === true && (
                        <div className="absolute -bottom-10 whitespace-nowrap px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-200">
                            Partner Ready
                        </div>
                    )
                }
            </div>

            {/* Right Options (Frame, Gallery) */}
            < div className="flex gap-6 items-center w-1/3 justify-end" >
                <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => {
                    const idx = FRAMES.findIndex(f => f.id === activeFrame.id);
                    const next = FRAMES[(idx + 1) % FRAMES.length];
                    onFrameChange(next);
                }}>
                    <div className="w-12 h-12 rounded-2xl border-2 border-retro-black/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-retro-black/70 group-hover:bg-retro-gold/20 group-hover:border-retro-gold group-hover:text-retro-black transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    </div>
                    <div className="flex flex-col items-center leading-none mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-retro-black/80">Frame</span>
                        <span className="text-[9px] font-sans-body text-retro-black/60 uppercase tracking-widest">{activeFrame.name.replace(' Frame', '')}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onOpenGallery}>
                    <div className="w-12 h-12 rounded-2xl border-2 border-retro-black/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-retro-black/70 group-hover:bg-retro-gold/20 group-hover:border-retro-gold group-hover:text-retro-black transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <span className="text-xs font-serif-display text-retro-black/80 font-bold uppercase tracking-wider">Gallery</span>
                </div>
            </div >

        </div >
    );
}
