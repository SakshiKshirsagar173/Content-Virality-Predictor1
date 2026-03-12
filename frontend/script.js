async function predict() {
    const text = document.getElementById("content").value;

    // CALL BACKEND
    const res = await fetch("https://YOUR_RENDER_URL.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });

    const data = await res.json();
    const result = document.getElementById("result");
    result.innerHTML = '';
    result.classList.remove('updated');
    const cautionEl = document.getElementById('cautionBox');
    if (cautionEl) cautionEl.classList.add('hidden');

    // helper to wait
    const wait = ms => new Promise(res => setTimeout(res, ms));
    // Create a two-column row: left = prediction, right = score
    const resultRow = document.createElement('div');
    resultRow.className = 'result-row';

    const predCol = document.createElement('div');
    predCol.className = 'result-col pred-col';
    const scoreCol = document.createElement('div');
    scoreCol.className = 'result-col score-col';

    resultRow.appendChild(predCol);
    resultRow.appendChild(scoreCol);
    result.appendChild(resultRow);

    // Prediction elements (left column)
    const predHeading = document.createElement('div');
    predHeading.className = 'result-heading hidden';
    predHeading.innerHTML = 'Prediction:';
    predCol.appendChild(predHeading);

    await wait(350);
    predHeading.classList.remove('hidden');

    const predValue = document.createElement('div');
    predValue.className = 'result-value hidden';
    predValue.innerHTML = `<b>${data.label}</b>`;
    predCol.appendChild(predValue);

    await wait(350);
    predValue.classList.remove('hidden');

    // Score elements (right column) — created now but revealed later
    const scoreHeading = document.createElement('div');
    scoreHeading.className = 'result-heading hidden';
    scoreHeading.innerHTML = 'Score:';
    scoreCol.appendChild(scoreHeading);

    const scoreValue = document.createElement('div');
    scoreValue.className = 'result-value hidden';
    scoreValue.innerText = data.score !== undefined ? data.score.toFixed(2) : '-';
    scoreCol.appendChild(scoreValue);

    // Determine viral vs non-viral based on backend numeric code or label text.
    const labelText = (data && data.label) ? data.label.toString().toLowerCase() : '';
    // parse numeric score first
    const scoreNum = (data && data.score !== undefined && data.score !== null) ? parseFloat(data.score) : NaN;
    const VIRAL_SCORE_THRESHOLD = 0.5;
    // Only treat as viral when label includes 'viral' AND a numeric score above threshold is present
    const labelIndicatesViral = (data && (data.code === 1 || data.output === 1 || data.label === 1)) || labelText.includes('viral') || labelText.includes('viral spark');
    const isViral = labelIndicatesViral && (!isNaN(scoreNum) && scoreNum > VIRAL_SCORE_THRESHOLD);
    // Show caution only when NOT viral and score is present and <= threshold
    const showCaution = (!isViral) && !isNaN(scoreNum) && scoreNum <= VIRAL_SCORE_THRESHOLD;

    // If viral, show congratulations + sparkle and launch background confetti/crackers
    if (isViral) {
        // launch confetti crackers in background
        try{ launchConfetti({duration:2200, particleCount:90}); } catch(e){ /* fail silently */ }

        await wait(200);
        const congrats = document.createElement('div');
        congrats.className = 'congrats hidden';
        congrats.innerHTML = `<span class="congrats-text">Congratulations! ✨ Your content is a Viral Spark!</span>`;
        // Add a sparkle container
        const sparkleWrap = document.createElement('div');
        sparkleWrap.className = 'sparkle-wrap';
        for (let i = 0; i < 8; i++) {
            const s = document.createElement('span');
            s.className = 'sparkle';
            sparkleWrap.appendChild(s);
        }
        congrats.appendChild(sparkleWrap);
        result.appendChild(congrats);
        await wait(100);
        congrats.classList.remove('hidden');
    }

    // Previously a tile-style caution appeared here; it will now be shown after the score.

    // Show score after prediction (and congrats if any)
    await wait(400);
    scoreHeading.classList.remove('hidden');
    await wait(250);
    scoreValue.classList.remove('hidden');

    // Pulse the result briefly
    result.classList.add('updated');

    // Show caution box below prediction and score whenever the result is NOT viral
    if (!isViral) {
        await wait(200);
        if (cautionEl) {
            cautionEl.classList.remove('hidden');
            await wait(120);
        }
    }
}

// Simple confetti / crackers animation using canvas
function launchConfetti({duration = 2000, particleCount = 80} = {}){
    const colors = ['#7c5cff','#3dd4c6','#ffd166','#ff6b6b','#ff3b30'];
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    const particles = [];
    for (let i = 0; i < particleCount; i++){
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height * 0.5,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 4 + 2,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.2,
            life: 0,
            ttl: Math.random() * 120 + 80
        });
    }

    let start = performance.now();
    function frame(now){
        const t = now - start;
        ctx.clearRect(0,0,canvas.width,canvas.height);

        for (let p of particles){
            p.x += p.vx;
            p.y += p.vy + 0.5 * (p.life/60);
            p.vy += 0.02; // gravity
            p.rot += p.rotSpeed;
            p.life++;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
            ctx.restore();
        }

        if (t < duration){
            requestAnimationFrame(frame);
        } else {
            // fade out quickly
            const fadeStart = performance.now();
            const fade = () => {
                const ft = performance.now() - fadeStart;
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.globalAlpha = Math.max(1 - ft/300, 0);
                for (let p of particles){
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
                    ctx.restore();
                }
                ctx.globalAlpha = 1;
                if (ft < 300) requestAnimationFrame(fade); else canvas.remove();
            };
            requestAnimationFrame(fade);
        }
    }

    // handle resizing while animation runs
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    requestAnimationFrame(frame);
    // remove listener when done
    setTimeout(()=> window.removeEventListener('resize', onResize), duration + 500);
}
