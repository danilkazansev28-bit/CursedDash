// js/effects.js
if (!window.EffectsEngine) {
    window.EffectsEngine = {
        updateBackgroundPulse() {
            if (window.Game.bgPulseIntensity > 0) window.Game.bgPulseIntensity -= 0.04;
            const liveContainer = document.getElementById('gameContainer');
            if (liveContainer && window.Game.currentMusicFreq > 0) {
                let hue = Math.floor((window.Game.currentMusicFreq % 200) + 200); 
                let brightness = Math.floor(8 + window.Game.bgPulseIntensity * 16); 
                liveContainer.style.backgroundColor = `hsl(${hue}, 65%, ${brightness}%)`;
            } else if (liveContainer) {
                liveContainer.style.backgroundColor = '#0a0813';
            }
        },

        updateParticles() {
            for (let i = window.Game.particles.length - 1; i >= 0; i--) {
                const p = window.Game.particles[i]; p.x += p.vx; p.y += p.vy; 
                if (p.isSmoke) { p.vy -= 0.05; p.size += 0.2; } else { p.vy += 0.1; }
                p.life--; p.element.style.left = p.x + 'px'; p.element.style.top = (400 - p.y) + 'px'; 
                p.element.style.opacity = p.life / p.maxLife; p.element.style.width = p.size + 'px'; p.element.style.height = p.size + 'px';
                if (p.life <= 0) { p.element.remove(); window.Game.particles.splice(i, 1); } 
            }
        },

        createExplosion(x, y) {
            const clr = window.Game.SKINS[window.Game.selectedSkinIndex].bg, liveContainer = document.getElementById('gameContainer');
            if (!liveContainer) return;
            for (let i = 0; i < 24; i++) {
                const pEl = document.createElement('div'); pEl.classList.add('particle'); pEl.style.background = clr; liveContainer.appendChild(pEl);
                const angle = Math.random() * Math.PI * 2, speed = Math.random() * 6 + 2;
                window.Game.particles.push({ element: pEl, x: x + 20, y: y + 20, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 25 + 20, maxLife: 45, size: 6, isSmoke: false });
            }
        },

        createRocketTrail(x, y) {
            const liveContainer = document.getElementById('gameContainer'); if (!liveContainer || Math.random() > 0.4) return;
            const skinColor = window.Game.SKINS[window.Game.selectedSkinIndex].bg;
            const pEl = document.createElement('div'); pEl.classList.add('particle'); pEl.style.background = skinColor; pEl.style.boxShadow = `0 0 8px ${skinColor}`; liveContainer.appendChild(pEl);
            window.Game.particles.push({ element: pEl, x: x + 5, y: y + 15, vx: -Math.random() * 3 - 2, vy: (Math.random() - 0.5) * 2, life: 20, maxLife: 20, size: 5, isSmoke: false });
            if (Math.random() > 0.5) {
                const dEl = document.createElement('div'); dEl.classList.add('particle'); dEl.style.background = 'rgba(150, 150, 150, 0.4)'; dEl.style.borderRadius = '50%'; liveContainer.appendChild(dEl);
                window.Game.particles.push({ element: dEl, x: x, y: y + 15, vx: -Math.random() * 2 - 1, vy: Math.random() * 0.5, life: 30, maxLife: 30, size: 8, isSmoke: true });
            }
        }
    };
}
