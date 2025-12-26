import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export const VideoPlayer = forwardRef(({ stream, isMirrored = false, className, style, muted = false }, ref) => {
    const internalRef = useRef(null);

    // Sync external ref with internal ref so parent can access DOM node
    useImperativeHandle(ref, () => internalRef.current);

    useEffect(() => {
        if (internalRef.current && stream) {
            internalRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={internalRef}
            autoPlay
            playsInline
            muted={muted}
            className={className}
            style={style}
        />
    );
});

VideoPlayer.displayName = 'VideoPlayer';
