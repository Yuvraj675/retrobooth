export async function generateComposite(photos, activeFrame, activeFilter) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const images = [];
        let loadedCount = 0;

        // 1. Load User Photos
        photos.forEach((src) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === photos.length) {
                    drawComposite();
                }
            };
            img.src = src;
            images.push(img);
        });

        if (photos.length === 0) {
            // Should not happen, but safe fallback
            resolve(null);
        }

        function drawComposite() {
            // Determine Canvas Size & Logic based on Frame Type
            if (activeFrame.id === 'strip') {
                drawStrip();
            } else if (activeFrame.id === 'polaroid') {
                drawPolaroid();
            } else if (activeFrame.id === 'grid') {
                drawGrid();
            } else {
                // Default to Strip if unknown
                drawStrip();
            }

            resolve(canvas.toDataURL('image/jpeg', 0.95));
        }

        // --- Frame Logic: Vertical Film Strip ---
        function drawStrip() {
            // Reduced height to remove whitespace
            const stripWidth = 600;
            const stripHeight = 1500; // Reduced from 1800

            canvas.width = stripWidth;
            canvas.height = stripHeight;

            // 1. Background (Dark Film)
            ctx.fillStyle = '#1a1a1a'; // Dark, almost black
            ctx.fillRect(0, 0, stripWidth, stripHeight);

            // 2. Sprocket Holes
            const holeW = 20;
            const holeH = 14;
            const holeGap = 30; // pitch
            const holeMargin = 15; // from edge

            ctx.fillStyle = '#ffffff';

            // Draw holes on both sides
            for (let y = 20; y < stripHeight; y += holeGap) {
                // Left
                ctx.fillRect(holeMargin, y, holeW, holeH);
                // Right
                ctx.fillRect(stripWidth - holeMargin - holeW, y, holeW, holeH);
            }

            // 3. Layout Photos
            const contentX = holeMargin + holeW + 20;
            const contentW = stripWidth - (2 * contentX);
            const topPadding = 60;
            const bottomPadding = 100; // Reduced footer area
            const photoGap = 20;

            const totalPhotoHeight = stripHeight - topPadding - bottomPadding - (3 * photoGap);
            const photoH = totalPhotoHeight / 4;
            // Target H is calculated to fit height.
            // Width will be 2:1 aspect ratio? 
            // If photoW is constrained, let's just cover the area.

            let currentY = topPadding;

            images.forEach((img) => {
                // Draw white border for photo
                const borderWidth = 8;
                ctx.fillStyle = '#FDFBF7';
                ctx.fillRect(contentX - borderWidth, currentY - borderWidth, contentW + (2 * borderWidth), photoH + (2 * borderWidth));

                // Draw Photo
                if (activeFilter.css && activeFilter.css !== 'none') {
                    ctx.filter = activeFilter.css;
                }

                drawPhotoCover(img, contentX, currentY, contentW, photoH);
                ctx.filter = 'none';

                currentY += photoH + photoGap + (2 * borderWidth);
            });

            // 4. Footer Text
            ctx.fillStyle = '#FDFBF7';
            ctx.font = 'bold 32px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('RETROBOOTH', stripWidth / 2, stripHeight - 60);
        }

        // --- Frame Logic: 2x2 Grid (Vintage Style) ---
        function drawGrid() {
            // 2:1 images in 2x2 Grid.
            // Each row width = 2 + 2 = 4 units.
            // Each col height = 1 + 1 = 2 units.
            // Overall aspect ratio = 2:1.

            const baseW = 1600;
            const baseH = 800; // 2:1 Canvas

            canvas.width = baseW;
            canvas.height = baseH;

            // Vintage Dark Background
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Solid dark background

            // "Jagged Edge" / Sprocket Simulation
            // We'll draw simple white blocks along top/bottom to look like film leader or sprockets
            ctx.fillStyle = '#222';
            const holeSize = 20;
            const holeSpacing = 40;

            // Draw faux sprockets visual
            ctx.fillStyle = '#000'; // Darker holes? Or white holes?
            // "Black translucent background" -> Canvas export to JPEG doesn't support transparency well.
            // We will simulate the look.

            // Let's use a nice margin
            const margin = 50;
            const gap = 20;

            // Calculate Cell Sizes
            const cellW = (baseW - (2 * margin) - gap) / 2;
            const cellH = (baseH - (2 * margin) - gap) / 2;

            const pos = [
                { x: margin, y: margin },
                { x: margin + cellW + gap, y: margin },
                { x: margin, y: margin + cellH + gap },
                { x: margin + cellW + gap, y: margin + cellH + gap }
            ];

            images.forEach((img, i) => {
                if (pos[i]) {
                    const p = pos[i];

                    // Jagged Border Effect (Rough white border)
                    ctx.save();
                    ctx.translate(p.x, p.y);

                    // Draw rough border
                    ctx.fillStyle = '#FDFBF7';
                    ctx.fillRect(-5, -5, cellW + 10, cellH + 10);

                    // Filter
                    if (activeFilter.css && activeFilter.css !== 'none') {
                        ctx.filter = activeFilter.css;
                    }

                    // Draw Image
                    // 2:1 image into ~2:1 cell, should match perfectly
                    drawPhotoCover(img, 0, 0, cellW, cellH);

                    ctx.restore();
                    ctx.filter = 'none';
                }
            });

            // Center Badge
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(baseW / 2, baseH / 2, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#FDFBF7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(baseW / 2, baseH / 2, 35, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#FDFBF7';
            ctx.font = 'bold 12px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('RB', baseW / 2, baseH / 2 + 4);
        }

        // --- Frame Logic: Wide Polaroid ---
        function drawPolaroid() {
            // Input is a single 2:1 image (1200x600).
            // We want a "Wide Polaroid" look.
            // Let's define the photo area size within the polaroid.
            // Let's give it generous white borders.
            
            const photoW = 1000;
            const photoH = 500; // 2:1 aspect ratio
            
            const borderTop = 60;
            const borderSide = 60;
            const borderBottom = 200; // Classic thick bottom
            
            const canvasW = photoW + (2 * borderSide);
            const canvasH = photoH + borderTop + borderBottom;
            
            canvas.width = canvasW;
            canvas.height = canvasH;
            
            // 1. Draw Paper Background (Slightly off-white for realism)
            ctx.fillStyle = '#ffffff'; 
            ctx.fillRect(0, 0, canvasW, canvasH);
            
            // Add subtle texture/noise or gradient for "paper" feel?
            // Simple gradient to give depth
            const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#f8f8f8');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvasW, canvasH);

            // 2. Draw Photo
            if (images[0]) {
                const img = images[0];
                
                // Inner Shadow for depth
                ctx.save();
                ctx.translate(borderSide, borderTop);
                
                // Draw Shadow/Inset effect
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;
                
                // Filter
                if (activeFilter.css && activeFilter.css !== 'none') {
                    ctx.filter = activeFilter.css;
                }
                
                // Draw Image
                drawPhotoCover(img, 0, 0, photoW, photoH);
                
                ctx.restore();
                ctx.filter = 'none';
                
                // Fine inner stroke
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(borderSide, borderTop, photoW, photoH);
            }

            // 3. Handwritten Text
            ctx.fillStyle = '#444'; // Dark grey ink
            ctx.textAlign = 'center';
            
            // Check if we have a handwriting font, if not fallback to cursive
            ctx.font = 'normal 48px "Brush Script MT", "Caveat", "Dancing Script", cursive'; 
            // Note: Canvas needs the font to be loaded in the DOM. Basic websafe fonts are safer.
            // "Courier New" is redundant for polaroid. "Segoe Script" on Windows?
            
            // Let's try to set a few
            ctx.font = 'italic 32px "Segoe Print", "Chalkboard SE", "Marker Felt", sans-serif';
            
            const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            ctx.fillText(`RetroBooth • ${date}`, canvasW / 2, canvasH - 80);
        }

        // Helper: Object-Fit Cover
        function drawPhotoCover(img, x, y, w, h) {
            const sw = img.width;
            const sh = img.height;
            const sAspect = sw / sh;
            const tAspect = w / h;
            let dW, dH, dX, dY;

            if (sAspect > tAspect) {
                dH = sh;
                dW = sh * tAspect;
                dX = (sw - dW) / 2;
                dY = 0;
            } else {
                dW = sw;
                dH = sw / tAspect;
                dX = 0;
                dY = (sh - dH) / 2;
            }

            ctx.drawImage(img, dX, dY, dW, dH, x, y, w, h);
        }
    });
}
