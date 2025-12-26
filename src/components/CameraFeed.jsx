import React from 'react';

export function CameraFeed({ videoRef, isFlashing, activeFilter }) {
    return (
        <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-stone-800 bg-black aspect-video w-full max-w-2xl">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-300 ${activeFilter?.class || ''}`}
                style={{ filter: activeFilter?.css }}
            />

            {/* Flash Effect */}
            <div className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-100 ${isFlashing ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Vintage Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        </div>
    );
}
