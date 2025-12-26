import { useState, useEffect, useRef } from 'react';

export function useCamera() {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    const streamRef = useRef(null);

    useEffect(() => {
        async function initCamera() {
            try {
                console.log("Requesting camera access...");
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                    audio: false, // Ensure no audio to prevent feedback/permission issues if not needed
                });
                console.log("Camera access granted:", mediaStream.id);
                setStream(mediaStream);
                streamRef.current = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                setError(err);
                console.error("Error accessing camera:", err);
            }
        }

        initCamera();

        return () => {
            console.log("Cleaning up camera stream...");
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log("Stopped track:", track.kind);
                });
            }
        };
    }, []);

    return { videoRef, stream, error };
}
