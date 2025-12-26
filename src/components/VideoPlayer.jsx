import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export const VideoPlayer = forwardRef(({ stream, isMirrored = false, className, style, muted = false }, ref) => {
    const internalRef = useRef(null);

    // Sync external ref with internal ref so parent can access DOM node
    useImperativeHandle(ref, () => internalRef.current);

    useEffect(() => {
        const video = internalRef.current;
        if (video && stream) {
            // Only update if the stream has actually changed to prevent 'AbortError'
            if (video.srcObject !== stream) {
                video.srcObject = stream;
                video.play().catch(e => {
                    if (e.name !== 'AbortError') {
                        console.error("Error playing video:", e);
                    }
                });
            }
        } else if (video) {
            video.srcObject = null;
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
