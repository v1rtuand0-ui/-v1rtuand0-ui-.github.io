// OPTIMASI 4: IIFE (Immediately Invoked Function Expression)
// Mencegah Global Scope Pollution dan konflik variabel.
(function() {
    'use strict';

    // --- STATE MANAGEMENT ---
    const state = {
        isBlown: false,
        confettiActive: false,
        animationId: null
    };

    // --- DOM CACHE (Query Selectors sekali saja) ---
    const elements = {
        halaman2: document.getElementById('halaman2'),
        flame: document.getElementById('flame1'),
        smoke: document.getElementById('smoke1'),
        title: document.getElementById('cake-title'),
        instruction: document.querySelector('.instruction'),
        canvas: document.getElementById('confetti-canvas')
    };

    const ctx = elements.canvas.getContext('2d', { alpha: true }); // Alpha true untuk transparansi
    const confettiPieces = [];
    const colors = ['#00b894', '#0984e3', '#e84393', '#fdcb6e', '#6c5ce7', '#ff7675'];
    const PI_180 = Math.PI / 180;
    // Pre-calculate constant

    // --- INIT CANVAS ---
    function resizeCanvas() {
        elements.canvas.width = window.innerWidth;
        elements.canvas.height = window.innerHeight;
    }
    resizeCanvas();
    // --- EVENT LISTENERS ---
    
    // Interaction: Blow Candle
    elements.halaman2.addEventListener('click', function () {
        if (!state.isBlown) blowCandle();
    }, { passive: true });
    // Passive listener untuk performa scroll yang lebih baik jika event overlap

    // Debounced Resize Listener (Anti-Lag)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 150); // Delay 150ms
    }, { passive: true });
    // --- CORE LOGIC ---

    function blowCandle() {
        // Update UI Visuals
        elements.flame.classList.add('off');
        elements.smoke.classList.add('puff');
        state.isBlown = true;

        // Delay logic updates slightly to match CSS transitions
        setTimeout(() => {
            elements.title.innerText = "Yeay! Selamat Ulang Tahun! 🎉";
            elements.title.style.color = "#d63031";
            // Gunakan requestAnimationFrame untuk style change agar sync dengan refresh rate
            requestAnimationFrame(() => {
                elements.title.style.fontSize = "1.5rem";
                elements.instruction.style.visibility = 'hidden';
            });
            startConfetti();
        }, 300);
    }

    // --- CONFETTI ENGINE (Optimized) ---

    function startConfetti() {
        confettiPieces.length = 0;
        // Reset array tanpa garbage collection berat
        state.confettiActive = true;
        // Object Creation
        for (let i = 0; i < 300; i++) {
            confettiPieces.push({
                x: Math.random() * elements.canvas.width,
                y: Math.random() * elements.canvas.height - elements.canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 4 - 2,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }

        animateConfetti();
        // Stop generating new resets after 3 seconds
        setTimeout(() => {
            state.confettiActive = false;
        }, 3000);
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
        let piecesVisible = 0;

        const cHeight = elements.canvas.height;
        const cWidth = elements.canvas.width;
        // Loop Optimization: Cache length
        const len = confettiPieces.length;
        for (let i = 0; i < len; i++) {
            const p = confettiPieces[i];
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * PI_180);
            // Use pre-calc constant
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();

            // Recycle logic
            if (p.y > cHeight) {
                if (state.confettiActive) {
                    p.y = -20;
                    p.x = Math.random() * cWidth;
                    piecesVisible++;
                }
            } else {
                piecesVisible++;
            }
        }

        if (state.confettiActive || piecesVisible > 0) {
            state.animationId = requestAnimationFrame(animateConfetti);
        } else {
            cancelAnimationFrame(state.animationId);
            ctx.clearRect(0, 0, cWidth, cHeight);
        }
    }

})();