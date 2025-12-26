import { useState, useCallback, useRef, useEffect } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { CameraFeed } from './components/CameraFeed';
import { Controls } from './components/Controls';
import { PhotoStrip } from './components/PhotoStrip';
import { ModalOverlay } from './components/ModalOverlay';
import { RoomJoin } from './components/RoomJoin';
import { RemoteFeed } from './components/RemoteFeed';
import { useCamera } from './hooks/useCamera';
import { usePeer } from './hooks/usePeer';
import { FILTERS, FRAMES } from './utils/constants';
import { generateComposite } from './utils/imageProcessing';
import { WelcomeScreen } from './components/WelcomeScreen';

function App() {
  // 1. Core State & Refs
  const { stream: localStream } = useCamera();

  // Refs for CANVAS CAPTURE (passed to VideoPlayer)
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const handleDataRef = useRef(null);

  const [role, setRole] = useState('host'); // 'host' | 'guest'
  const [isReady, setIsReady] = useState(false); // Local ready state (guest)
  const [remoteReady, setRemoteReady] = useState(undefined); // Remote ready state (host view)
  const [hasStarted, setHasStarted] = useState(false); // Welcome screen state

  // -- App State --
  const [photos, setPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(true); // Default to ON

  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [activeFrame, setActiveFrame] = useState(FRAMES[0]);
  const [modalImage, setModalImage] = useState(null);

  // 2. PeerJS Integration (Defined early to use refs)
  const stableHandler = useCallback((data) => {
    if (handleDataRef.current) handleDataRef.current(data);
  }, []);

  const { peerId, connectToPeer, broadcast, remoteStream } = usePeer(localStream, stableHandler);

  // 3. Helper Functions (Defined BEFORE usages)

  const onConnect = (id, isHostRole = true) => {
    connectToPeer(id);
    setRole(isHostRole ? 'host' : 'guest');
    if (!isHostRole) setIsReady(false);
  };

  const handleStart = (mode, roomId = null) => {
    setHasStarted(true);
    if (mode === 'create') {
      setRole('host');
    } else if (mode === 'join' && roomId) {
      setRole('guest');
      onConnect(roomId, false);
    } else if (mode === 'solo') {
      setRole('solo');
      // No peer connection needed
    }
  };

  const updateSettings = (newFilter, newFrame) => {
    if (newFilter) setActiveFilter(newFilter);
    if (newFrame) setActiveFrame(newFrame);

    if (role === 'host') {
      broadcast({
        type: 'SETTINGS_UPDATE',
        payload: {
          filterId: newFilter?.id,
          frameId: newFrame?.id
        }
      });
    }
  };

  const handleEnlarge = async (currentPhotos = photos) => {
    if (currentPhotos.length > 0) {
      const composite = await generateComposite(currentPhotos, activeFrame, activeFilter);
      setModalImage(composite);
    }
  };

  const handleDownload = () => {
    if (modalImage) {
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.jpg`;
      link.href = modalImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper for Object-Fit Cover (Used by capturePhoto)
  const drawCover = (ctx, img, x, y, w, h) => {
    if (!img) return;
    const sRatio = img.videoWidth / img.videoHeight;
    const dRatio = w / h;
    let sx, sy, sw, sh;

    if (sRatio > dRatio) {
      sh = img.videoHeight;
      sw = sh * dRatio;
      sx = (img.videoWidth - sw) / 2;
      sy = 0;
    } else {
      sw = img.videoWidth;
      sh = sw / dRatio;
      sx = 0;
      // sy = (img.videoHeight - sh) / 2; // Center Crop
      // Mobile Adjustment: Prioritize top-center (faces are usually higher)
      sy = (img.videoHeight - sh) * 0.3;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  };

  // 4. Capture Logic
  const capturePhoto = useCallback(() => {
    // Determine context (Dual vs Solo, Portrait vs Landscape)
    const isDual = remoteStream && remoteVideoRef.current && role !== 'solo';
    const canvas = document.createElement('canvas');
    // Standardize higher resolution (Always 2:1)
    canvas.width = 1200;
    canvas.height = 600;

    const ctx = canvas.getContext('2d');

    // Helper to generate Noise Pattern
    const drawNoise = (ctx, w, h) => {
      const iData = ctx.createImageData(w, h);
      const buffer32 = new Uint32Array(iData.data.buffer);
      const len = buffer32.length;
      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.5) buffer32[i] = 0xff000000; // Black noise
      }

      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = w;
      noiseCanvas.height = h;
      noiseCanvas.getContext('2d').putImageData(iData, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.15; // Subtle grain
      ctx.drawImage(noiseCanvas, 0, 0, w, h);
      ctx.restore();
    };

    // Helper to draw a single video slot (Background Blur + Foreground)
    const drawCompositeFrame = (ctx, video, x, y, w, h) => {
      if (!video) return;

      // 1. Background Blur (Fill Cover)
      ctx.save();
      ctx.filter = 'blur(40px) brightness(0.8)';
      // Draw to cover the full slot area
      drawCover(ctx, video, x, y, w, h);
      ctx.restore();

      // 2. Grain Overlay on Background
      drawNoise(ctx, w, h); // This applies to the whole canvas if simply called, so we might need clipping if dual.
      // For simplicity in dual, we apply noise at the end globally or per slot.
      // Let's do per-slot noise if we clip, but global is easier. We'll do global noise at the end.

      // 3. Foreground (Cover/Fill)
      // MATCH PREVIEW: Use drawCover to ensure WYSIWYG.
      // Preview uses 'object-cover', so we must use 'drawCover'.

      ctx.save();

      // Shadow (Matches CSS drop-shadow-2xl)
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      ctx.translate(x + w, y);
      ctx.scale(-1, 1);

      // Use drawCover instead of contain math
      drawCover(ctx, video, 0, 0, w, h);

      ctx.restore();
    };


    // Fill Background
    ctx.fillStyle = '#f0ebe6'; // Retro cream base
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isDual) {
      // --- DUAL MODE ---
      const w = canvas.width / 2;
      const h = canvas.height;

      const isHost = role === 'host';
      const leftVideo = isHost ? localVideoRef.current : remoteVideoRef.current;
      const rightVideo = isHost ? remoteVideoRef.current : localVideoRef.current;

      // Draw Left
      if (leftVideo) {
        // Clip left area
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.clip();
        drawCompositeFrame(ctx, leftVideo, 0, 0, w, h);
        ctx.restore();
      }

      // Draw Right
      if (rightVideo) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(w, 0, w, h);
        ctx.clip();
        drawCompositeFrame(ctx, rightVideo, w, 0, w, h);
        ctx.restore();
      }

      // Divider
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w, h);
      ctx.stroke();

    } else {
      // --- SOLO MODE ---
      const video = localVideoRef.current;
      if (video) {
        drawCompositeFrame(ctx, video, 0, 0, canvas.width, canvas.height);
      }
    }

    // Global Grain if we didn't do it per slot (we didn't above to keep it simple)
    // Actually, drawCompositeFrame didn't apply noise correctly because of scope. 
    // Let's apply global noise now.
    drawNoise(ctx, canvas.width, canvas.height);

    // Border
    ctx.lineWidth = 40;
    ctx.strokeStyle = '#fff'; // White border like polaroid
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setPhotos(prev => [...prev, dataUrl]);

  }, [localStream, remoteStream, role]);

  // 5. Sequence Logic (depends on capturePhoto)
  const startCaptureSequence = async (isInitiator = true) => {
    if (isCapturing) return;

    if (isInitiator && role !== 'solo') {
      broadcast({ type: 'CAPTURE_START' });
    }

    setIsCapturing(true);
    setPhotos([]);

    const PHOTO_COUNT = activeFrame.count;

    for (let i = 0; i < PHOTO_COUNT; i++) {
      // Countdown
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);

      // Flash Effect (Only if Enabled)
      if (flashEnabled) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 150);
      }

      capturePhoto();

      if (i < PHOTO_COUNT - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    // End sequence ONLY here
    setIsCapturing(false);
  };

  // 6. Effects

  // Data Handler Effect
  useEffect(() => {
    handleDataRef.current = (data) => {
      if (data.type === 'CAPTURE_START') {
        startCaptureSequence(false);
      }
      if (data.type === 'SETTINGS_UPDATE') {
        const { filterId, frameId } = data.payload;
        if (filterId) setActiveFilter(FILTERS.find(f => f.id === filterId) || FILTERS[0]);
        if (frameId) setActiveFrame(FRAMES.find(f => f.id === frameId) || FRAMES[0]);
      }
      if (data.type === 'READY_STATUS') {
        setRemoteReady(data.payload);
      }
    };
  });

  // Auto-Popup Effect
  useEffect(() => {
    if (!isCapturing && photos.length === activeFrame.count && photos.length > 0) {
      handleEnlarge(photos);
    }
  }, [isCapturing, photos, activeFrame]);

  // 7. Render
  return (
    <div className="min-h-screen w-full bg-retro-cream text-retro-black flex flex-col items-center justify-center overflow-x-hidden relative selection:bg-retro-gold/30 font-sans-body">

      {!hasStarted && <WelcomeScreen onStart={handleStart} isCameraReady={!!localStream} />}

      <RoomJoin
        peerId={peerId}
        onJoin={onConnect}
        isConnected={!!remoteStream}
        isHost={role === 'host'}
      />

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div key={countdown} className="text-[150px] md:text-[250px] font-bold text-retro-cream font-serif-display drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-bounce-in">
            {countdown}
          </div>
        </div>
      )}

      {/* GLOBAL FLASH OVERLAY - Covers entire screen */}
      <div className={`fixed inset-0 z-[9999] bg-white pointer-events-none transition-opacity duration-150 ease-out ${isFlashing ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Main Container - Retro Theme */}
      <div className="relative w-full h-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col items-center transition-all">

        {/* Mobile Landscape Floating Back Button */}
        <button
          onClick={() => window.location.reload()}
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-retro-cream/80 backdrop-blur-sm border border-[#1a2e1a]/10 text-[#1a2e1a] shadow-lg
            hidden landscape:flex lg:landscape:hidden"
          title="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        {/* Header - Hide on Mobile Landscape to save space */}
        <header className="w-full flex justify-between items-center mb-4 z-10 shrink-0 landscape:hidden lg:landscape:flex">
          <div className="w-20 flex justify-start">
            <button
              onClick={() => window.location.reload()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a2e1a]/5 hover:bg-[#1a2e1a]/10 text-[#1a2e1a] transition-all hover:scale-105"
              title="Back to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif-display text-[#1a2e1a] tracking-tight">
            RetroBooth
          </h1>
          <div className="w-20 flex justify-end">
            {/* Spacer to keep title centered */}
          </div>
        </header>

        {/* Content Area: Main Feed Only (Sidebar Removed) */}
        {/* Landscape Mode: Use Flex Row to put controls on side, OR just tighter column */}
        {/* Desktop (lg) should revert to flex-col (Video Top, Controls Bottom) */}
        <div className="flex flex-col landscape:flex-row lg:landscape:flex-col w-full h-full items-center justify-center relative flex-1 min-h-0 gap-4 landscape:gap-2 lg:landscape:gap-4">

          {/* Live Feed Container */}
          <div className={`
             relative transition-all duration-300 ease-in-out
             shadow-2xl rounded-3xl overflow-hidden border-8 border-retro-cream
             bg-[#FDFBF7] flex justify-center items-center gap-4
             
             bg-[#FDFBF7] flex justify-center items-center gap-4
             
             /* ALWAYS 2:1 Aspect Ratio (Normal Photobooth Strip Preview) */
             w-full max-w-4xl aspect-[2/1]
             
             ${isFlashing ? 'opacity-0' : 'opacity-100'}
          `}>

            {/* Solo Mode View */}
            {role === 'solo' ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-full h-full overflow-hidden bg-[#eceae5]">
                  <VideoPlayer
                    ref={localVideoRef}
                    stream={localStream}
                    isMirrored={true}
                    className={`w-full h-full object-cover transform scale-x-[-1] rounded-sm ${activeFilter?.class || ''}`}
                    style={{ filter: activeFilter?.css }}
                    muted={true}
                  />
                </div>
              </div>
            ) : (
              /* Dual Mode View */
              <>
                {/* PERSON 1 */}
                <div className="relative w-1/2 h-full flex flex-col items-center justify-center">
                  <div className="relative w-full h-full overflow-hidden border-r-4 border-retro-cream bg-[#eceae5]">
                    {role === 'host' ? (
                      <VideoPlayer
                        ref={localVideoRef}
                        stream={localStream}
                        isMirrored={true}
                        className={`w-full h-full object-cover transform scale-x-[-1] ${activeFilter?.class || ''}`}
                        style={{ filter: activeFilter?.css }}
                        muted={true}
                      />
                    ) : (
                      remoteStream ? (
                        <VideoPlayer
                          ref={remoteVideoRef}
                          stream={remoteStream}
                          isMirrored={true}
                          className={`w-full h-full object-cover transform scale-x-[-1] ${activeFilter?.class || ''}`}
                          style={{ filter: activeFilter?.css }}
                        />
                      ) : <div className="flex h-full items-center justify-center text-[#1a2e1a]/30 font-serif-display italic text-2xl">Waiting...</div>
                    )}
                  </div>
                  {/* Floating Label */}
                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-retro-cream/80 backdrop-blur-sm border border-[#1a2e1a]/10 text-[#1a2e1a]/60 text-xs font-serif-display z-20">
                    Person 1
                  </div>
                </div>

                {/* PERSON 2 */}
                <div className="relative w-1/2 h-full flex flex-col items-center justify-center">
                  <div className="relative w-full h-full overflow-hidden bg-[#eceae5]">
                    {role === 'host' ? (
                      remoteStream ? (
                        <VideoPlayer
                          ref={remoteVideoRef}
                          stream={remoteStream}
                          isMirrored={true}
                          className={`w-full h-full object-cover transform scale-x-[-1] ${activeFilter?.class || ''}`}
                          style={{ filter: activeFilter?.css }}
                          muted={true}
                        />
                      ) : <div className="flex h-full items-center justify-center text-[#1a2e1a]/30 font-serif-display italic text-2xl">Waiting...</div>
                    ) : (
                      <VideoPlayer
                        ref={localVideoRef}
                        stream={localStream}
                        isMirrored={true}
                        className={`w-full h-full object-cover transform scale-x-[-1] ${activeFilter?.class || ''}`}
                        style={{ filter: activeFilter?.css }}
                        muted={true}
                      />
                    )}
                  </div>
                  {/* Floating Label */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-retro-cream/80 backdrop-blur-sm border border-[#1a2e1a]/10 text-[#1a2e1a]/60 text-xs font-serif-display z-20">
                    Person 2
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Controls Section (Bottom or Right) */}
          <div className="mt-6 md:mt-12 w-full max-w-xl shrink-0 
              landscape:mt-0 landscape:w-[35%] landscape:h-full landscape:flex landscape:items-center
              lg:landscape:mt-12 lg:landscape:w-full lg:landscape:h-auto lg:landscape:block
          ">
            <div className="w-full landscape:scale-90 landscape:origin-center lg:landscape:scale-100">
              <Controls
                onCapture={startCaptureSequence}
                isCapturing={isCapturing}
                // countdown={countdown} // REMOVED from Controls
                activeFilter={activeFilter}
                onFilterChange={(f) => updateSettings(f, null)}
                activeFrame={activeFrame}
                onFrameChange={(f) => updateSettings(null, f)}
                role={role}
                isReady={isReady}
                onReadyChange={(ready) => {
                  setIsReady(ready);
                  broadcast({ type: 'READY_STATUS', payload: ready });
                }}
                remoteReady={remoteReady}
                onOpenGallery={() => handleEnlarge()}
                flashEnabled={flashEnabled}
                onFlashToggle={() => setFlashEnabled(prev => !prev)}
                isConnected={!!remoteStream || role === 'solo'} /* Allow capture in solo */
              />
            </div>
          </div>

        </div>
      </div>

      {modalImage && (
        <ModalOverlay
          image={modalImage}
          onClose={() => setModalImage(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

export default App;
