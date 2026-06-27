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
                if (p.isSmoke) { p.vy -= 0.03; p.size += 0.25; } else { p.vy += 0.15; }
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

        // ИСПРАВЛЕНИЕ: Огонь теперь генерируется ВСЕГДА и непрерывно
        createRocketTrail(x, y, isHolding) {
            const liveContainer = document.getElementById('gameContainer');
            if (!liveContainer) return;
            const skinColor = window.Game.SKINS[window.Game.selectedSkinIndex].bg;
            
            // Настройки длины и скорости пламени (сильнее при зажатом Пробеле)
            let particleCount = isHolding ? 3 : 1;
            let baseLife = isHolding ? 25 : 14;
            let baseSpeedX = isHolding ? -5 : -3;

            for(let k = 0; k < particleCount; k++) {
                const pEl = document.createElement('div'); pEl.classList.add('particle');
                pEl.style.background = skinColor; pEl.style.boxShadow = `0 0 10px ${skinColor}`;
                liveContainer.appendChild(pEl);
                window.Game.particles.push({ element: pEl, x: x - 5, y: y + 12, vx: baseSpeedX - Math.random() * 3, vy: (Math.random() - 0.5) * 3, life: baseLife, maxLife: baseLife, size: Math.random() * 3 + 4, isSmoke: false });
            }

            // Шлейф дыма
            if (Math.random() < 0.7) {
                const dEl = document.createElement('div'); dEl.classList.add('particle');
                dEl.style.background = 'rgba(160, 160, 160, 0.35)'; dEl.style.borderRadius = '50%';
                liveContainer.appendChild(dEl);
                window.Game.particles.push({ element: dEl, x: x - 10, y: y + 12, vx: -2 - Math.random() * 2, vy: Math.random() * 0.5, life: 35, maxLife: 35, size: 7, isSmoke: true });
            }
        }
    };
}
