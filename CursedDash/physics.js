// js/physics.js - Часть 1 из 4
import './state.js';
import './audio.js';

window.PhysicsEngine = {
    pressAction() { 
        if (!window.Game.gameActive || window.Game.isEditorMode) return; 
        window.Game.isHoldingAction = true; 
        
        if (window.Game.isInsideOrb && window.Game.currentMode === 'cube') {
            let jumpPower = window.Game.JUMP_CUBE;
            if (window.Game.orbs[window.Game.activeOrbIndex]) {
                const type = window.Game.orbs[window.Game.activeOrbIndex].type;
                if (type === 'orb-pink') jumpPower = window.Game.JUMP_CUBE * 0.7;
                if (type === 'orb-red') jumpPower = window.Game.JUMP_CUBE * 1.4;
            }
            window.Game.cubeVelocityY = jumpPower; 
            window.Game.isGrounded = false; 
            window.Game.targetRotation += 180; 
            window.Game.rotationSpeed = 180 / Math.abs((2 * jumpPower) / window.Game.GRAVITY_CUBE); 
            window.AudioEngine.playPortalSound(); 
            return;
        }
        
        if (window.Game.currentMode === 'cube' && window.Game.isGrounded) { 
            window.Game.cubeVelocityY = window.Game.JUMP_CUBE; 
            window.Game.isGrounded = false; 
            window.Game.targetRotation += 180; 
            window.Game.rotationSpeed = 180 / Math.abs((2 * window.Game.JUMP_CUBE) / window.Game.GRAVITY_CUBE); 
        } 
    },
    releaseAction() { window.Game.isHoldingAction = false; },
    isPointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
        let v0x = cx - ax, v0y = cy - ay, v1x = bx - ax, v1y = by - ay, v2x = px - ax, v2y = py - ay;
        let dot00 = v0x*v0x + v0y*v0y, dot01 = v0x*v1x + v0y*v1y, dot02 = v0x*v2x + v0y*v2y, dot11 = v1x*v1x + v1y*v1y, dot12 = v1x*v2x + v1y*v2y;
        let invDenom = 1 / (dot00 * dot11 - dot01 * dot01), u = (dot11 * dot02 - dot01 * dot12) * invDenom, v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        return (u >= 0) && (v >= 0) && (u + v <= 1);
    },
    checkTriangleCollision(cL, cR, cB, cT, s) {
        let ax = s.x, ay = s.bottom, bx = s.x + s.width, by = s.bottom, cx = s.x + s.width/2, cy = s.bottom + s.height;
        if(s.type === 'spike-ceil') { ay = s.bottom + s.height; by = s.bottom + s.height; cy = s.bottom; }
        let points = [{x:cL, y:cB}, {x:cR, y:cB}, {x:cL, y:cT}, {x:cR, y:cT}, {x:cL+20, y:cB+20}];
        for(let p of points) { if(this.isPointInTriangle(p.x, p.y, ax, ay, bx, by, cx, cy)) return true; }
        return false;
    },
// js/physics.js - Часть 2 из 4
    update() {
        if (!window.Game.gameActive) { 
            this.updateParticles(); 
            window.Game.animationFrameId = requestAnimationFrame(() => this.update()); 
            return; 
        }
        if (window.Game.spawnProtectionFrames > 0) window.Game.spawnProtectionFrames--;

        if (window.Game.currentMode === 'cube') {
            window.Game.cubeVelocityY += window.Game.GRAVITY_CUBE; window.Game.cubeY += window.Game.cubeVelocityY;
            if (window.Game.cubeY >= 0) { window.Game.cubeY = 0; window.Game.cubeVelocityY = 0; window.Game.isGrounded = true; window.Game.rotation = window.Game.targetRotation; }
            if (!window.Game.isGrounded && window.Game.rotation < window.Game.targetRotation) { 
                window.Game.rotation += window.Game.rotationSpeed; if (window.Game.rotation > window.Game.targetRotation) window.Game.rotation = window.Game.targetRotation; 
            }
        } else {
            if (window.Game.isHoldingAction) { 
                window.Game.cubeVelocityY += window.Game.THRUST_SHIP; 
                // МЕХАНИКА ШЛЕЙФА: Создаем искры пламени, летящие из хвоста кораблика (X=100)
                this.createRocketTrail(100, 50 - window.Game.cubeY);
            } else { 
                window.Game.cubeVelocityY += window.Game.GRAVITY_SHIP; 
            }
            window.Game.cubeVelocityY = Math.max(-6, Math.min(6, window.Game.cubeVelocityY)); window.Game.cubeY += window.Game.cubeVelocityY;
            if (window.Game.cubeY >= 0) { window.Game.cubeY = 0; window.Game.cubeVelocityY = 0; }
            const ceilingY = -310; if (window.Game.cubeY <= ceilingY) { window.Game.cubeY = ceilingY; window.Game.cubeVelocityY = 0; }
            window.Game.rotation = window.Game.cubeVelocityY * 4;
        }
        
        const liveCube = document.getElementById('cube');
        if (liveCube) liveCube.style.transform = `translateY(${window.Game.cubeY}px) rotate(${window.Game.rotation}deg)`;
        
        let activeBaseSpeed = window.Game.LEVEL_DATA[window.Game.currentLevel] ? window.Game.LEVEL_DATA[window.Game.currentLevel].speed : 5.5;
        let finalMovementSpeed = activeBaseSpeed * window.Game.currentSpeedMultiplier;

        window.Game.score += finalMovementSpeed;
        const liveScore = document.getElementById('scoreVal'); if (liveScore) liveScore.textContent = Math.floor(window.Game.score);

        const liveProgText = document.getElementById('progressText');
        const liveProgFill = document.getElementById('progressBarFill');

        if (window.Game.isTestingCustom) {
            let pct = Math.min(99, Math.floor((window.Game.score / window.Game.levelMaxLength) * 100));
            if (window.Game.score > window.Game.levelMaxLength) {
                pct = Math.min(100, 99 + Math.min(1, Math.floor((window.Game.score - window.Game.levelMaxLength) / 1000)));
            }
            if (liveProgText) liveProgText.textContent = pct + "%"; 
            if (liveProgFill) liveProgFill.style.width = pct + "%";
        } else {
            let pct = Math.min(100, Math.floor((window.Game.score / 15000) * 100));
            if (liveProgText) liveProgText.textContent = pct + "%"; 
            if (liveProgFill) liveProgFill.style.width = pct + "%";
            if (pct >= 100) { 
                window.Game.gameActive = false; 
                window.AudioEngine.stopMusic(); 
                setTimeout(() => { alert("Уровень пройден!"); window.MenuEngine.backToMenu(); }, 50); 
                return; 
            }
        }

        if (!window.Game.isTestingCustom) {
            window.Game.spawnTimer++; 
            if (window.Game.spawnTimer > (Math.random() * 40 + 75) / window.Game.currentSpeedMultiplier) {
                const rand = Math.random(), startX = 850, liveObjLayer = document.getElementById('objectsLayer');
                if (liveObjLayer) {
                    if (rand < 0.1) {
                        const pEl = document.createElement('div'); pEl.className = 'portal'; pEl.style.left = startX + 'px'; pEl.style.bottom = (window.Game.currentMode === 'cube' ? '50px' : '150px'); liveObjLayer.appendChild(pEl); window.Game.portals.push({ element: pEl, x: startX, width: 35, height: 95, bottom: (window.Game.currentMode === 'cube' ? 50 : 150) });
                    } else if (rand < 0.16) {
                        const types = ['speed-slow', 'speed-normal', 'speed-fast'], t = types[Math.floor(Math.random() * 3)], spEl = document.createElement('div'); spEl.className = `speed-portal ${t}`; spEl.style.left = startX + 'px'; liveObjLayer.appendChild(spEl); window.Game.speedPortals.push({ element: spEl, x: startX, type: t, width: 25, height: 100, bottom: 50 });
                    } else if (rand < 0.25) {
                        const types = ['orb-purple', 'orb-pink', 'orb-red'], t = types[Math.floor(Math.random() * 3)], oEl = document.createElement('div'); oEl.className = `orb ${t}`; oEl.style.left = startX + 'px'; const b = Math.random() * 80 + 100; oEl.style.bottom = b + 'px'; liveObjLayer.appendChild(oEl); window.Game.orbs.push({ element: oEl, type: t, x: startX, width: 30, height: 30, bottom: b });
                    } else if (rand < 0.35) {
                        const types = ['pad-yellow', 'pad-pink', 'pad-red'], t = types[Math.floor(Math.random() * 3)], pdEl = document.createElement('div'); pdEl.className = `pad ${t}`; pdEl.style.left = startX + 'px'; pdEl.style.bottom = '50px'; liveObjLayer.appendChild(pdEl); window.Game.pads.push({ element: pdEl, type: t, x: startX, width: 34, height: 12, bottom: 50 });
                    } else if (rand < 0.5) {
                        const bEl = document.createElement('div'); bEl.className = 'solid-block'; bEl.style.left = startX + 'px'; bEl.style.bottom = '90px'; liveObjLayer.appendChild(bEl); window.Game.solidBlocks.push({ element: bEl, x: startX, width: 40, height: 40, bottom: 90 });
                    } else {
                        const spike = document.createElement('div'); spike.className = 'spike'; spike.style.left = startX + 'px'; spike.style.bottom = '50px'; liveObjLayer.appendChild(spike); window.Game.spikes.push({ element: spike, type: 'spike-floor', x: startX, width: 30, height: 40, bottom: 50 });
                    }
                }
                window.Game.spawnTimer = 0;
            }
        }
// js/physics.js - Часть 3 из 4
        const cL = 100, cR = 140, cB = 50 - window.Game.cubeY, cT = cB + window.Game.CUBE_SIZE, p = 5;
        let standingOnBlock = false; if (window.Game.cubeY === 0) { window.Game.isGrounded = true; } else { window.Game.isGrounded = false; }

        for (let i = window.Game.solidBlocks.length - 1; i >= 0; i--) {
            const b = window.Game.solidBlocks[i]; b.x -= finalMovementSpeed; b.element.style.left = b.x + 'px';
            if (b.x < -50) { b.element.remove(); window.Game.solidBlocks.splice(i, 1); continue; }
            if (cR > b.x && cL < b.x + b.width && cT > b.bottom && cB < b.bottom + b.height) {
                const overlapY = cB - (b.bottom + b.height);
                if (window.Game.cubeVelocityY >= 0 && overlapY >= -12) {
                    window.Game.cubeY = 50 - (b.bottom + b.height); window.Game.cubeVelocityY = 0; window.Game.isGrounded = true; standingOnBlock = true; window.Game.rotation = window.Game.targetRotation;
                } else { if (cR - p > b.x && cL + p < b.x + b.width && window.Game.spawnProtectionFrames === 0) { window.MenuEngine.gameOver(); } }
            }
        }
        if (!standingOnBlock && window.Game.cubeY < 0) { window.Game.isGrounded = false; }

        for (let i = window.Game.pads.length - 1; i >= 0; i--) {
            const pd = window.Game.pads[i]; pd.x -= finalMovementSpeed; pd.element.style.left = pd.x + 'px';
            if (pd.x < -50) { pd.element.remove(); window.Game.pads.splice(i, 1); continue; }
            if (cR > pd.x && cL < pd.x + pd.width && window.Game.cubeVelocityY >= 0 && Math.abs(cB - (pd.bottom + pd.height)) < 12) {
                let bouncePower = window.Game.JUMP_CUBE * 1.1;
                if (pd.type === 'pad-pink') bouncePower = window.Game.JUMP_CUBE * 0.75;
                if (pd.type === 'pad-red') bouncePower = window.Game.JUMP_CUBE * 1.55;
                window.Game.cubeVelocityY = bouncePower; window.Game.isGrounded = false;
                window.Game.targetRotation += 180; window.Game.rotationSpeed = 180 / Math.abs((2 * bouncePower) / window.Game.GRAVITY_CUBE);
                window.AudioEngine.playPortalSound();
            }
        }
        for (let i = window.Game.portals.length - 1; i >= 0; i--) {
            const prt = window.Game.portals[i]; prt.x -= finalMovementSpeed; prt.element.style.left = prt.x + 'px';
            if (prt.x < -50) { prt.element.remove(); window.Game.portals.splice(i, 1); continue; }
            if (cR > prt.x && cL < prt.x + prt.width && cB < prt.bottom + prt.height && cT > prt.bottom) {
                window.AudioEngine.playPortalSound(); prt.element.remove(); window.Game.portals.splice(i, 1);
                const liveCube = document.getElementById('cube');
                if (window.Game.currentMode === 'cube') { 
                    window.Game.currentMode = 'ship'; if (liveCube) liveCube.style.borderRadius = '50% 10px 10px 50%'; 
                } else { 
                    window.Game.currentMode = 'cube'; if (liveCube) liveCube.style.borderRadius = '4px'; 
                    window.Game.targetRotation = Math.round(window.Game.rotation / 90) * 90; 
                }
                if (window.Game.applySkin) window.Game.applySkin();
            }
        }
        for (let i = window.Game.speedPortals.length - 1; i >= 0; i--) {
            const sp = window.Game.speedPortals[i]; sp.x -= finalMovementSpeed; sp.element.style.left = sp.x + 'px';
            if (sp.x < -50) { sp.element.remove(); window.Game.speedPortals.splice(i, 1); continue; }
            if (cR > sp.x && cL < sp.x + sp.width && cT > sp.bottom && cB < sp.bottom + sp.height) {
                window.AudioEngine.playPortalSound(); sp.element.remove(); window.Game.speedPortals.splice(i, 1);
                if (sp.type === 'speed-slow') window.Game.currentSpeedMultiplier = 0.65;
                if (sp.type === 'speed-normal') window.Game.currentSpeedMultiplier = 1.0;
                if (sp.type === 'speed-fast') window.Game.currentSpeedMultiplier = 1.5;
            }
        }
        let insideAnyOrb = false;
        for (let i = window.Game.orbs.length - 1; i >= 0; i--) {
            const ob = window.Game.orbs[i]; ob.x -= finalMovementSpeed; ob.element.style.left = ob.x + 'px';
            if (ob.x < -50) { ob.element.remove(); window.Game.orbs.splice(i, 1); continue; }
            if (cR > ob.x && cL < ob.x + ob.width && cB < ob.bottom + ob.height && cT > ob.bottom) { insideAnyOrb = true; window.Game.activeOrbIndex = i; }
        }
        window.Game.isInsideOrb = insideAnyOrb; if (!window.Game.isInsideOrb) window.Game.activeOrbIndex = -1;
        for (let i = window.Game.spikes.length - 1; i >= 0; i--) {
            const spike = window.Game.spikes[i]; spike.x -= finalMovementSpeed; spike.element.style.left = spike.x + 'px';
            if (spike.x < -50) { spike.element.remove(); window.Game.spikes.splice(i, 1); continue; }
            if (cR > spike.x && cL < spike.x + spike.width && cT > spike.bottom && cB < spike.bottom + spike.height && window.Game.spawnProtectionFrames === 0) {
                if (this.checkTriangleCollision(cL, cR, cB, cT, spike)) { window.MenuEngine.gameOver(); return; }
            }
        }
        this.updateParticles(); 
        window.Game.animationFrameId = requestAnimationFrame(() => this.update());
    },
    
    // Анимация частиц: теперь они плавно затухают, уменьшаются и рассеиваются назад
    updateParticles() { 
        for (let i = window.Game.particles.length - 1; i >= 0; i--) { 
            const p = window.Game.particles[i]; 
            p.x += p.vx; p.y += p.vy; 
            if (p.isSmoke) { p.vy -= 0.05; p.size += 0.2; } else { p.vy += 0.1; } // Дым летит вверх, искры падают
            p.life--; 
            p.element.style.left = p.x + 'px'; 
            p.element.style.top = (400 - p.y) + 'px'; 
            p.element.style.opacity = p.life / p.maxLife;
            p.element.style.width = p.size + 'px';
            p.element.style.height = p.size + 'px';
            if (p.life <= 0) { p.element.remove(); window.Game.particles.splice(i, 1); } 
        } 
    },
// js/physics.js - Часть 4 из 4
    resetGame() {
        if (window.Game.animationFrameId) { cancelAnimationFrame(window.Game.animationFrameId); window.Game.animationFrameId = null; }
        window.Game.gameActive = false; this.clearGameContainer(); 
        window.Game.cubeY = 0; window.Game.cubeVelocityY = 0; window.Game.isGrounded = true; window.Game.rotation = 0; window.Game.targetRotation = 0; window.Game.currentMode = 'cube'; window.Game.currentSpeedMultiplier = 1.0; window.Game.spawnProtectionFrames = 15; window.Game.isHoldingAction = false; window.Game.isInsideOrb = false; window.Game.activeOrbIndex = -1; 
        const liveCube = document.getElementById('cube'); if (liveCube) { liveCube.style.display = 'flex'; liveCube.style.borderRadius = '4px'; liveCube.style.transform = `translateY(0px) rotate(0deg)`; }
        window.Game.score = 0; window.Game.currentSpeed = window.Game.LEVEL_DATA[window.Game.currentLevel] ? window.Game.LEVEL_DATA[window.Game.currentLevel].speed : 5.5; window.Game.spawnTimer = 0; 
        const liveScore = document.getElementById('scoreVal'); if (liveScore) liveScore.textContent = '0'; 
        const liveProgFill = document.getElementById('progressBarFill'); if (liveProgFill) liveProgFill.style.width = '0%'; 
        const liveProgText = document.getElementById('progressText'); if (liveProgText) liveProgText.textContent = '0%'; 
        const liveOverScreen = document.getElementById('gameOverScreen'); if (liveOverScreen) liveOverScreen.style.display = 'none'; 
        
        if (window.Game.isTestingCustom) { 
            const liveStopBtn = document.getElementById('stopTestBtn'); if (liveStopBtn) liveStopBtn.style.display = 'block'; 
            const liveObjLayer = document.getElementById('objectsLayer');
            if (liveObjLayer) {
                let maxTargetX = 800;
                window.Game.customObjects.forEach(obj => { if (obj.x > maxTargetX) maxTargetX = obj.x; });
                window.Game.levelMaxLength = maxTargetX + 200;

                window.Game.customObjects.forEach(obj => { 
                    const elClone = obj.element.cloneNode(true); elClone.style.display = 'block'; 
                    elClone.style.left = obj.x + 'px';
                    liveObjLayer.appendChild(elClone); 
                    if (obj.type === 'solid-block') window.Game.solidBlocks.push({ element: elClone, x: obj.x, width: obj.width, height: obj.height, bottom: obj.bottom });
                    else if (obj.type === 'spike-floor' || obj.type === 'spike-ceil') window.Game.spikes.push({ element: elClone, type: obj.type, x: obj.x, width: obj.width, height: obj.height, bottom: obj.bottom }); 
                    else if (obj.type === 'portal') window.Game.portals.push({ element: elClone, x: obj.x, width: obj.width, height: obj.height, bottom: obj.bottom }); 
                    else if (obj.type.startsWith('speed-')) window.Game.speedPortals.push({ element: elClone, x: obj.x, type: obj.type, width: 25, height: 100, bottom: 50 }); 
                    else if (obj.type.startsWith('orb-')) window.Game.orbs.push({ element: elClone, type: obj.type, x: obj.x, width: 30, height: 30, bottom: obj.bottom }); 
                    else if (obj.type.startsWith('pad-')) window.Game.pads.push({ element: elClone, type: obj.type, x: obj.x, width: 34, height: 12, bottom: 50 }); 
                }); 
            }
        }
        window.Game.gameActive = true; 
        if (window.Game.toggleSkins && window.Game.applySkin) window.Game.applySkin();
        if (window.AudioEngine) window.AudioEngine.startMusic();
        window.Game.animationFrameId = requestAnimationFrame(() => this.update());
    },
    clearGameContainer() { 
        window.Game.gameActive = false; const liveObjLayer = document.getElementById('objectsLayer'); if (liveObjLayer) liveObjLayer.innerHTML = ''; 
        window.Game.spikes = []; window.Game.portals = []; window.Game.speedPortals = []; window.Game.orbs = []; window.Game.pads = []; window.Game.solidBlocks = []; window.Game.particles = []; 
    },
    createExplosion(x, y) { const clr = window.Game.SKINS[window.Game.selectedSkinIndex].bg, liveContainer = document.getElementById('gameContainer'); if (!liveContainer) return; for (let i = 0; i < 24; i++) { const pEl = document.createElement('div'); pEl.classList.add('particle'); pEl.style.background = clr; liveContainer.appendChild(pEl); const angle = Math.random() * Math.PI * 2, speed = Math.random() * 6 + 2; window.Game.particles.push({ element: pEl, x: x + 20, y: y + 20, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: Math.random() * 25 + 20, maxLife: 45, size: 6, isSmoke: false }); } },
    
    // Функция создания шлейфа: генерирует неоновые искры под цвет скина и серый дым
    createRocketTrail(x, y) {
        const liveContainer = document.getElementById('gameContainer');
        if (!liveContainer || Math.random() > 0.4) return; // Ограничиваем спавн для оптимизации
        const skinColor = window.Game.SKINS[window.Game.selectedSkinIndex].bg;
        
        // 1. Создаем летящую искру пламени
        const pEl = document.createElement('div'); pEl.classList.add('particle');
        pEl.style.background = skinColor; pEl.style.boxShadow = `0 0 8px ${skinColor}`;
        liveContainer.appendChild(pEl);
        window.Game.particles.push({ element: pEl, x: x + 5, y: y + 15, vx: -Math.random() * 3 - 2, vy: (Math.random() - 0.5) * 2, life: 20, maxLife: 20, size: 5, isSmoke: false });

        // 2. Создаем рассеивающийся дым
        if (Math.random() > 0.5) {
            const dEl = document.createElement('div'); dEl.classList.add('particle');
            dEl.style.background = 'rgba(150, 150, 150, 0.4)'; dEl.style.borderRadius = '50%';
            liveContainer.appendChild(dEl);
            window.Game.particles.push({ element: dEl, x: x, y: y + 15, vx: -Math.random() * 2 - 1, vy: Math.random() * 0.5, life: 30, maxLife: 30, size: 8, isSmoke: true });
        }
    },
    initRestartSystem() { const liveRestartBtn = document.getElementById('restartBtn'); if (liveRestartBtn) { liveRestartBtn.replaceWith(liveRestartBtn.cloneNode(true)); document.getElementById('restartBtn').addEventListener('click', () => { const liveOverScreen = document.getElementById('gameOverScreen'); if (liveOverScreen) liveOverScreen.style.display = 'none'; this.resetGame(); }); } }
};

document.addEventListener("DOMContentLoaded", () => { setTimeout(() => window.PhysicsEngine.initRestartSystem(), 100); });
