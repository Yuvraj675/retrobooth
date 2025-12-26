import { useRef, useCallback } from 'react';

// NOTE: This logic will move into App.jsx directly for state access, 
// using this artifact just to draft the merging function.

// HELPER: Merge two images (dataURLs or Video Elements)
export async function mergeDualCapture(localVideo, remoteVideo) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720; // Maintain HD aspect ratio
    const ctx = canvas.getContext('2d');

    // Draw Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Config
    const halfWidth = canvas.width / 2;
    const height = canvas.height;

    // Draw Local (Left)
    if (localVideo) {
        // We want to center crop the video to fit half width (8:9 aspect ratio basically)
        // Video is 16:9 (1280x720)
        // Target is 640x720

        // Calculate crop to keep center
        const vW = localVideo.videoWidth || 1280;
        const vH = localVideo.videoHeight || 720;
        // video aspect = 1.77
        // target aspect = 0.88

        // We need to crop width
        const renderW = vH * (halfWidth / height); // Height is consistent
        const cropX = (vW - renderW) / 2;

        // Draw Left
        ctx.save();
        ctx.translate(halfWidth, 0); // Flip logic if needed?
        ctx.scale(-1, 1); // Local is usually mirrored
        // Coordinate system is flipped, so drawing at 0 goes to -640...
        // Let's keep it simple: Draw normally then flip? No, complex.
        // Simplified: Draw flipped context at 0 to halfWidth

        // It's getting complex to mix flipped/non-flipped.
        // Let's assume passed video is standard, we mirror it here.
        ctx.drawImage(localVideo, cropX, 0, renderW, vH, 0, 0, halfWidth, height);
        ctx.restore();
    }

    // Draw Remote (Right)
    if (remoteVideo) {
        // Similar crop
        const vW = remoteVideo.videoWidth || 1280;
        const vH = remoteVideo.videoHeight || 720;
        const renderW = vH * (halfWidth / height);
        const cropX = (vW - renderW) / 2;

        ctx.drawImage(remoteVideo, cropX, 0, renderW, vH, halfWidth, 0, halfWidth, height);
    }

    // Draw Divider Line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, height);
    ctx.stroke();

    return canvas.toDataURL('image/jpeg', 0.9);
}
