// js/effects.js - Часть 1 из 2
if (!window.EffectsEngine) {
    window.EffectsEngine = {
        updateBackgroundPulse() {
            if (window.Game.bgPulseIntensity > 0) window.Game.bgPulseIntensity -= 0.04;
            const liveContainer = document.getElementById('gameContainer');
            if (liveContainer && window.Game.currentMusicFreq > 0) {
                let hue = Math.floor((window.Game.currentMusicFreq % 200) + 200); 
                let brightness = Math.floor(8 + window.Game.bgPulseIntensity * 16); 
                liveContainer.style.backgroundColor = `hsl(${hue}, 65%, ${brightness}%)`;
                
                if (window.Game.currentSpeedMultiplier >= 1.5) {
                    let blurIntensity = Math.max(0, window.Game.bgPulseIntensity * 3.5);
                    liveContainer.style.filter = `blur(${blurIntensity}px)`;
                } else {
                    liveContainer.style.filter = 'none';
                }
            } else if (liveContainer) {
                liveContainer.style.backgroundColor = '#0a0813';
                liveContainer.style.filter = 'none';
            }
        },

        updateParticles() {
            for (let i = window.Game.particles.length - 1; i >= 0; i--) {
                const p = window.Game.particles[i]; p.x += p.vx; p.y += p.vy; 
                if (p.isSmoke) { 
                    p.vy += 0.02; // Пыль плавно взлетает вверх
                    p.size += 0.3; // И красиво расширяется, как облачко
                } else { 
                    p.vy += 0.15; 
                }
                p.life--; p.element.style.left = p.x + 'px'; p.element.style.top = (400 - p.y) + 'px'; 
                p.element.style.opacity = p.life / p.maxLife; p.element.style.width = p.size + 'px'; p.element.style.height = p.size + 'px';
                if (p.life <= 0) { p.element.remove(); window.Game.particles.splice(i, 1); } 
            }
        },
// js/effects.js - Часть 2 из 2
        createExplosion(x, y) {
            const clr = window.Game.SKINS[window.Game.selectedSkinIndex] ? window.Game.SKINS[window.Game.selectedSkinIndex].bg : '#e94560';
            const liveContainer = document.getElementById('gameContainer');
            if (!liveContainer) return;
            for (let i = 0; i < 24; i++) {
                const pEl = document.createElement('div'); pEl.classList.add('particle'); pEl.style.background = clr; liveContainer.appendChild(pEl);
                const angle = Math.random() * Math.PI * 2, speed = Math.random() * 6 + 2;
                window.Game.particles.push({ element: pEl, x: x + 20, y: y + 20, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 25 + 20, maxLife: 45, size: 6, isSmoke: false });
            }
        },

        createRocketTrail(x, y, isHolding) {
            const liveContainer = document.getElementById('gameContainer');
            if (!liveContainer) return;
            const skinColor = window.Game.SKINS[window.Game.selectedSkinIndex] ? window.Game.SKINS[window.Game.selectedSkinIndex].bg : '#e94560';
            
            let particleCount = isHolding ? 3 : 1;
            let baseLife = isHolding ? 24 : 12;
            let baseSpeedX = isHolding ? -6 : -3;

            for(let k = 0; k < particleCount; k++) {
                const pEl = document.createElement('div'); pEl.classList.add('particle');
                pEl.style.background = skinColor; pEl.style.boxShadow = `0 0 10px ${skinColor}`;
                liveContainer.appendChild(pEl);
                window.Game.particles.push({ element: pEl, x: x - 8, y: y + 16, vx: baseSpeedX - Math.random() * 2, vy: (Math.random() - 0.5) * 2, life: baseLife, maxLife: baseLife, size: Math.random() * 3 + 5, isSmoke: false });
            }
        },

        // НОВЫЙ МЕТОД: Создание эффекта пыли из-под кубика при приземлении
        createLandSmoke(x, y) {
            const liveContainer = document.getElementById('gameContainer');
            if (!liveContainer) return;

            for (let i = 0; i < 8; i++) {
                const smokeEl = document.createElement('div');
                smokeEl.classList.add('particle');
                
                // Красивый серый полупрозрачный цвет дыма
                smokeEl.style.background = 'rgba(200, 200, 200, 0.5)';
                smokeEl.style.borderRadius = '50%';
                liveContainer.appendChild(smokeEl);

                // Пыль разлетается влево и вправо из-под кубика
                const vx = (Math.random() - 0.5) * 4 - 2; // Смещение назад по ходу движения
                const vy = Math.random() * 2; // Легкий полет вверх

                window.Game.particles.push({
                    element: smokeEl,
                    x: x + 20 + (Math.random() - 0.5) * 20, // По всей ширине куба
                    y: y,
                    vx: vx,
                    vy: vy,
                    life: Math.random() * 15 + 10,
                    maxLife: 25,
                    size: Math.random() * 4 + 6,
                    isSmoke: true
                });
            }
        }
    };
}
