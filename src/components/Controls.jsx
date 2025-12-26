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
        <div className="w-full flex flex-wrap landscape:flex-nowrap landscape:flex-col lg:landscape:flex-row lg:flex-nowrap items-center justify-between px-2 sm:px-12 py-2 sm:py-6 gap-y-2 landscape:gap-y-4 lg:gap-0 h-full landscape:justify-center lg:justify-between">

            {/* 1. LEFT SETTINGS (Flash, Filter) */}
            {/* Mobile Portrait: 50% width, Top Row, Order 1 */}
            {/* Mobile Landscape: 100% width, Stack Index 1 */}
            <div className="w-1/2 landscape:w-full lg:w-1/3 flex justify-evenly landscape:justify-center lg:justify-start gap-1 md:gap-8 items-center order-1 lg:order-none">

                {/* Flash */}
                <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onFlashToggle}>
                    <div className={`w-12 h-12 landscape:w-10 landscape:h-10 rounded-2xl border-2 transition-all shadow-sm flex items-center justify-center 
                        ${flashEnabled
                            ? 'border-retro-gold bg-retro-gold/10 text-retro-black'
                            : 'border-retro-black/10 bg-white/50 text-retro-black/40'
                        }
                    `}>
                        {flashEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="landscape:w-5 landscape:h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="landscape:w-5 landscape:h-5"><path d="M19 6.91L18.5 6.55L12 10.33V22L9 22V12.1L3.9 15.06L3.4 14.7L13 9.1L4 4.1L4.5 3.73L11 8.9V2L14 2V8.3L19.1 5.34L19.6 5.7L10 11.3L19 16.3L18.5 16.66L12 11.5Z" opacity="0.2" /><path d="M3 3l18 18"></path><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" style={{ opacity: 0.2 }}></polygon></svg>
                        )}
                    </div>
                    <span className="text-[10px] landscape:text-[8px] font-serif-display text-retro-black/80 font-bold uppercase tracking-wider">{flashEnabled ? 'On' : 'Off'}</span>
                </div>

                {/* Filter */}
                <div className="w-16 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => {
                    const idx = FILTERS.findIndex(f => f.id === activeFilter.id);
                    const next = FILTERS[(idx + 1) % FILTERS.length];
                    onFilterChange(next);
                }}>
                    <div className="w-12 h-12 landscape:w-10 landscape:h-10 rounded-2xl border-2 border-retro-black/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-retro-black/70 group-hover:bg-retro-gold/20 group-hover:border-retro-gold group-hover:text-retro-black transition-all shadow-sm relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="landscape:w-5 landscape:h-5"><circle cx="12" cy="12" r="10"></circle><circle cx="10" cy="10" r="3"></circle><line x1="21" y1="21" x2="15" y2="15"></line></svg>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-retro-gold opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-retro-rust"></span>
                        </span>
                    </div>
                    <div className="w-full flex flex-col items-center leading-none mt-1">
                        <span className="text-[10px] landscape:text-[8px] font-bold uppercase tracking-wider text-retro-black/80 truncate max-w-full text-center">{activeFilter.name}</span>
                    </div>
                </div>
            </div>

            {/* 2. CENTER SHUTTER */}
            {/* Mobile Portrait: Full Width, Order 3 */}
            {/* Mobile Landscape: Full Width, Stack Index 2 */}
            <div className="relative w-full landscape:w-full lg:w-1/3 flex justify-center order-3 landscape:order-2 lg:order-none lg:-mt-8 shrink-0">
                <button
                    onClick={onCapture}
                    disabled={role === 'host' && isConnected && !remoteReady}
                    className={`
                        w-16 h-16 landscape:w-20 landscape:h-20 md:w-28 md:h-28 lg:landscape:w-28 lg:landscape:h-28 rounded-full flex items-center justify-center transition-all bg-retro-cream 
                        shadow-[0_10px_40px_-10px_rgba(192,88,50,0.5)] border-4 md:border-8 border-retro-cream z-20 group aspect-square flex-none
                        ${(role === 'host' && isConnected && !remoteReady)
                            ? 'opacity-50 cursor-not-allowed grayscale'
                            : 'hover:scale-105 active:scale-95 cursor-pointer hover:shadow-[0_20px_60px_-15px_rgba(192,88,50,0.6)]'
                        }
                    `}
                >
                    <div className="w-14 h-14 landscape:w-16 landscape:h-16 md:w-24 md:h-24 lg:landscape:w-24 lg:landscape:h-24 rounded-full border-2 md:border-4 border-retro-black/10 flex items-center justify-center relative overflow-hidden aspect-square flex-none">
                        <div className={`
                            absolute inset-0.5 md:inset-1 bg-retro-rust rounded-full transition-transform duration-300 md:group-hover:scale-110
                            ${isCapturing ? 'scale-90 opacity-80' : 'scale-100 opacity-100'}
                        `} />
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 text-white w-6 h-6 landscape:w-8 landscape:h-8 md:w-10 md:h-10"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </div>
                </button>

                {/* Remote Ready Status Indicator for Host */}
                {
                    role === 'host' && remoteReady === false && isConnected && (
                        <div className="absolute -bottom-8 whitespace-nowrap px-3 py-1 bg-retro-rust/10 text-retro-rust text-[9px] font-bold uppercase tracking-widest rounded-full animate-pulse border border-retro-rust/20">
                            Partner Not Ready
                        </div>
                    )
                }
                {
                    role === 'host' && remoteReady === true && (
                        <div className="absolute -bottom-8 whitespace-nowrap px-3 py-1 bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-widest rounded-full border border-green-200">
                            Partner Ready
                        </div>
                    )
                }
            </div>

            {/* 3. RIGHT SETTINGS (Frame, Gallery) */}
            {/* Mobile Portrait: 50% width, Top Row, Order 2 */}
            {/* Mobile Landscape: 100% width, Stack Index 3 */}
            <div className="w-1/2 landscape:w-full lg:w-1/3 flex justify-evenly landscape:justify-center lg:justify-end gap-1 md:gap-8 items-center order-2 landscape:order-3 lg:order-none">

                {/* Frame */}
                <div className="w-16 flex flex-col items-center gap-1 group cursor-pointer" onClick={() => {
                    const idx = FRAMES.findIndex(f => f.id === activeFrame.id);
                    const next = FRAMES[(idx + 1) % FRAMES.length];
                    onFrameChange(next);
                }}>
                    <div className="w-12 h-12 landscape:w-10 landscape:h-10 rounded-2xl border-2 border-retro-black/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-retro-black/70 group-hover:bg-retro-gold/20 group-hover:border-retro-gold group-hover:text-retro-black transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="landscape:w-5 landscape:h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    </div>
                    <div className="w-full flex flex-col items-center leading-none mt-1">
                        <span className="text-[10px] landscape:text-[8px] font-bold uppercase tracking-wider text-retro-black/80 truncate max-w-full text-center">{activeFrame.name.replace(' Frame', '')}</span>
                    </div>
                </div>

                {/* Gallery */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onOpenGallery}>
                    <div className="w-12 h-12 landscape:w-10 landscape:h-10 rounded-2xl border-2 border-retro-black/10 bg-white/50 backdrop-blur-sm flex items-center justify-center text-retro-black/70 group-hover:bg-retro-gold/20 group-hover:border-retro-gold group-hover:text-retro-black transition-all shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="landscape:w-5 landscape:h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <span className="text-[10px] landscape:text-[8px] text-retro-black/80 font-bold uppercase tracking-wider">Gallery</span>
                </div>
            </div>

        </div>
    );
}
