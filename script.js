document.addEventListener('DOMContentLoaded', () => {
    initParticleAnimation();
    initHudTilt();
});

function initParticleAnimation() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const state = {
        width: 0,
        height: 0,
        dpr: 1,
        fov: 380,
        depth: 1600,
        speed: prefersReducedMotion ? 0.22 : 0.85,
        stars: [],
        lastTime: performance.now(),
        mouseX: 0,
        mouseY: 0
    };

    function resize() {
        state.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        state.width = window.innerWidth;
        state.height = window.innerHeight;

        canvas.width = Math.floor(state.width * state.dpr);
        canvas.height = Math.floor(state.height * state.dpr);
        canvas.style.width = `${state.width}px`;
        canvas.style.height = `${state.height}px`;

        ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

        initStars();
    }

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function initStars() {
        const count = prefersReducedMotion ? 140 : 260;
        state.stars = Array.from({ length: count }, () => createStar(true));
    }

    function createStar(randomZ = false) {
        const x = randomBetween(-state.width / 2, state.width / 2);
        const y = randomBetween(-state.height / 2, state.height / 2);
        const z = randomZ ? randomBetween(1, state.depth) : state.depth;
        const hue = Math.random() > 0.5 ? 185 : 305;

        return { x, y, z, hue };
    }

    function updateStar(star, dt) {
        const mx = (state.mouseX - state.width / 2) / state.width;
        const my = (state.mouseY - state.height / 2) / state.height;

        const depthFactor = 1 - star.z / state.depth;
        const drift = prefersReducedMotion ? 0 : 0.06;

        star.x += mx * drift * dt * depthFactor;
        star.y += my * drift * dt * depthFactor;
        star.z -= state.speed * dt;

        if (star.z <= 1) {
            Object.assign(star, createStar(false));
        }
    }

    function drawStar(star) {
        const scale = state.fov / (state.fov + star.z);
        const x2d = star.x * scale + state.width / 2;
        const y2d = star.y * scale + state.height / 2;

        if (x2d < -50 || x2d > state.width + 50 || y2d < -50 || y2d > state.height + 50) {
            return;
        }

        const radius = Math.max(0.6, scale * 2.2);
        const alpha = Math.min(1, Math.max(0, scale * 1.4));

        ctx.beginPath();
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${star.hue}, 100%, 62%, ${0.45 + alpha * 0.55})`;
        ctx.shadowBlur = prefersReducedMotion ? 0 : 18 * alpha;
        ctx.shadowColor = `hsla(${star.hue}, 100%, 62%, ${0.65 * alpha})`;
        ctx.fill();
    }

    function frame(now) {
        const dt = Math.min(40, now - state.lastTime);
        state.lastTime = now;

        ctx.fillStyle = prefersReducedMotion ? 'rgba(5, 6, 10, 1)' : 'rgba(5, 6, 10, 0.35)';
        ctx.fillRect(0, 0, state.width, state.height);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (const star of state.stars) {
            updateStar(star, dt);
            drawStar(star);
        }

        ctx.restore();
        ctx.shadowBlur = 0;

        requestAnimationFrame(frame);
    }

    window.addEventListener('pointermove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    });

    window.addEventListener('resize', resize);

    resize();
    requestAnimationFrame(frame);
}

function initHudTilt() {
    const panel = document.getElementById('hud-panel');
    if (!panel) return;

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) return;

    let rafId = 0;
    let targetRx = 0;
    let targetRy = 0;

    function apply() {
        panel.style.setProperty('--rx', `${targetRx.toFixed(2)}deg`);
        panel.style.setProperty('--ry', `${targetRy.toFixed(2)}deg`);
        rafId = 0;
    }

    function scheduleApply() {
        if (rafId) return;
        rafId = requestAnimationFrame(apply);
    }

    function onMove(e) {
        const rect = panel.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const maxX = 10;
        const maxY = 12;

        targetRy = (x - 0.5) * maxX;
        targetRx = (0.5 - y) * maxY;

        scheduleApply();
    }

    function reset() {
        targetRx = 0;
        targetRy = 0;
        scheduleApply();
    }

    panel.addEventListener('pointermove', onMove);
    panel.addEventListener('pointerleave', reset);
    panel.addEventListener('blur', reset);
}

window.HaoshuaiTech = {
    initParticleAnimation,
    initHudTilt
};
