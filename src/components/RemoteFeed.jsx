import React, { useEffect, forwardRef } from 'react';

export const RemoteFeed = forwardRef(({ stream }, ref) => {
    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream, ref]);

    if (!stream) return null;

    return (
        <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden border-2 border-stone-700 shadow-xl z-30 transition-all hover:scale-105">
            <video
                ref={ref}
                autoPlay
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror remote too for symmetry? usually convenient
            />
            <div className="absolute bottom-1 left-2 text-[10px] text-white/50 font-mono uppercase">Partner</div>
        </div>
    );
});

RemoteFeed.displayName = 'RemoteFeed';
