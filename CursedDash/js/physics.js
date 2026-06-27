// js/physics.js - Часть 1 из 4
import './state.js';
import './audio.js';
import './testNormal.js';
import './testCustom.js';
import './effects.js';

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
        
        // ЖЕЛЕЗНЫЙ ФИКС ПРЫЖКА: Прыгаем строго один раз только если железно стоим на земле!
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
        const shrinkX = 4; 
        const shrinkY = 4; 
        
        let ax = s.x + shrinkX; let ay = s.bottom; 
        let bx = s.x + s.width - shrinkX; let by = s.bottom; 
        let cx = s.x + s.width / 2; let cy = s.bottom + s.height - shrinkY;
        
        if(s.type === 'spike-ceil') { ay = s.bottom + s.height; by = s.bottom + s.height; cy = s.bottom + shrinkY; }
        
        let points = [{x:cL+2, y:cB+2}, {x:cR-2, y:cB+2}, {x:cL+2, y:cT-2}, {x:cR-2, y:cT-2}, {x:cL+20, y:cB+20}];
        for(let p of points) { if(this.isPointInTriangle(p.x, p.y, ax, ay, bx, by, cx, cy)) return true; }
        return false;
    },
    drawHitboxDebug(el, type, width, height, customStyle = '') {
        let debugDiv = el.querySelector('.debug-hitbox');
        if (!debugDiv) { debugDiv = document.createElement('div'); debugDiv.className = 'debug-hitbox'; el.appendChild(debugDiv); }
        // Если хитбоксы отключены кнопкой H, мгновенно прячем рамки, чтобы они не мешали играть
        if (!window.Game.showHitboxes) { debugDiv.style.display = 'none'; return; }
        debugDiv.style.cssText = `position:absolute; left:0; bottom:0; width:${width}px; height:${height}px; pointer-events:none; border:2px solid ${type === 'player' ? '#00ff88' : '#ff0055'}; background:${type === 'player' ? 'rgba(0,255,136,0.15)' : 'rgba(255,0,85,0.15)'}; z-index:9999; box-sizing:border-box; display:block; ${customStyle}`;
    },
// js/physics.js - Часть 2 из 4
    update() {
        if (!window.Game.gameActive) { if (window.EffectsEngine) window.EffectsEngine.updateParticles(); window.Game.animationFrameId = requestAnimationFrame(() => this.update()); return; }
        if (window.Game.spawnProtectionFrames > 0) window.Game.spawnProtectionFrames--;
        if (window.Game.padCooldown > 0) window.Game.padCooldown--;

        if (window.Game.currentMode === 'cube') {
            window.Game.cubeVelocityY += window.Game.GRAVITY_CUBE; window.Game.cubeY += window.Game.cubeVelocityY;
            
            // СТАБИЛИЗАЦИЯ ПОЛА: Обнуляем скорость и жестко фиксируем статус заземления grounded
            if (window.Game.cubeY >= 0) { 
                window.Game.cubeY = 0; 
                window.Game.cubeVelocityY = 0; 
                window.Game.isGrounded = true; 
                window.Game.rotation = window.Game.targetRotation; 
            } else {
                // Если кубик находится в воздухе, он точно НЕ на земле
                window.Game.isGrounded = false;
            }
            
            if (!window.Game.isGrounded && window.Game.rotation < window.Game.targetRotation) { 
                window.Game.rotation += window.Game.rotationSpeed; if (window.Game.rotation > window.Game.targetRotation) window.Game.rotation = window.Game.targetRotation; 
            }
        } else {
            if (window.Game.isHoldingAction) { window.Game.cubeVelocityY += window.Game.THRUST_SHIP; if (window.EffectsEngine) window.EffectsEngine.createRocketTrail(100, 50 - window.Game.cubeY, true); } 
            else { window.Game.cubeVelocityY += window.Game.GRAVITY_SHIP; if (window.EffectsEngine) window.EffectsEngine.createRocketTrail(100, 50 - window.Game.cubeY, false); }
            window.Game.cubeVelocityY = Math.max(-6, Math.min(6, window.Game.cubeVelocityY)); window.Game.cubeY += window.Game.cubeVelocityY;
            if (window.Game.cubeY >= 0) { window.Game.cubeY = 0; window.Game.cubeVelocityY = 0; }
            const ceilingY = -310; if (window.Game.cubeY <= ceilingY) { window.Game.cubeY = ceilingY; window.Game.cubeVelocityY = 0; }
            window.Game.rotation = window.Game.cubeVelocityY * 4;
        }
        
        const liveCube = document.getElementById('cube');
        if (liveCube) {
            // Контейнер хитбокса скользит ровно по Y
            liveCube.style.transform = `translateY(${window.Game.cubeY}px)`;
            liveCube.style.backgroundImage = `url("/assets/images/${window.Game.currentMode === 'cube' ? 'cube.png' : 'ship.png'}")`;
            
            // Вращаем только внутреннюю визуальную часть, чтобы не ломать триггеры коллизий
            let debugDiv = liveCube.querySelector('.debug-hitbox');
            if (debugDiv && window.Game.showHitboxes) {
                debugDiv.style.transform = `rotate(${window.Game.rotation}deg)`;
            } else {
                liveCube.style.transform = `translateY(${window.Game.cubeY}px) rotate(${window.Game.rotation}deg)`;
            }

            this.drawHitboxDebug(liveCube, 'player', 40, 40);
        }
        
        let activeBaseSpeed = window.Game.LEVEL_DATA[window.Game.currentLevel] ? window.Game.LEVEL_DATA[window.Game.currentLevel].speed : 5.5;
        let finalMovementSpeed = activeBaseSpeed * window.Game.currentSpeedMultiplier;
        window.Game.score += finalMovementSpeed;
        const liveScore = document.getElementById('scoreVal'); if (liveScore) liveScore.textContent = Math.floor(window.Game.score);

        const liveProgText = document.getElementById('progressText'); const liveProgFill = document.getElementById('progressBarFill');
        if (window.Game.isTestingCustom) {
            if (window.CustomTestEngine && window.CustomTestEngine.handleProgress(finalMovementSpeed, liveProgText, liveProgFill)) return;
            if (window.CustomTestEngine) window.CustomTestEngine.handleSpawning();
        } else {
            if (window.NormalLevelEngine && window.NormalLevelEngine.handleProgress(finalMovementSpeed, liveProgText, liveProgFill)) return;
            if (window.NormalLevelEngine) window.NormalLevelEngine.handleSpawning();
        }
        if (window.EffectsEngine) window.EffectsEngine.updateBackgroundPulse();
// js/physics.js - Часть 3 из 4
        const cL = 100, cR = 140, cB = 50 - window.Game.cubeY, cT = cB + window.Game.CUBE_SIZE, p = 5;
        let standingOnBlock = false;

        for (let i = window.Game.solidBlocks.length - 1; i >= 0; i--) {
            const b = window.Game.solidBlocks[i]; b.x -= finalMovementSpeed; b.element.style.left = b.x + 'px';
            b.element.style.backgroundImage = "url('/assets/images/block.png')";
            
            this.drawHitboxDebug(b.element, 'solid', 40, 40);

            if (b.x < -50) { b.element.remove(); window.Game.solidBlocks.splice(i, 1); continue; }
            if (cR > b.x && cL < b.x + b.width && cT > b.bottom && cB < b.bottom + b.height) {
                const overlapY = cB - (b.bottom + b.height);
                if (window.Game.cubeVelocityY >= 0 && overlapY >= -12) {
                    if (window.EffectsEngine && window.EffectsEngine.createLandSmoke) window.EffectsEngine.createLandSmoke(100, b.bottom + b.height);
                    window.Game.cubeY = 50 - (b.bottom + b.height); window.Game.cubeVelocityY = 0; window.Game.isGrounded = true; standingOnBlock = true; window.Game.rotation = window.Game.targetRotation;
                } else { if (cR - p > b.x && cL + p < b.x + b.width && window.Game.spawnProtectionFrames === 0) { window.MenuEngine.gameOver(); } }
            }
        }
        // Если кубик не стоит на твердом блоке и находится выше уровня пола — отключаем grounded
        if (!standingOnBlock && window.Game.cubeY < 0) { window.Game.isGrounded = false; }
        if (window.Game.cubeY === 0) { window.Game.isGrounded = true; }

        for (let i = window.Game.pads.length - 1; i >= 0; i--) {
            const pd = window.Game.pads[i]; pd.x -= finalMovementSpeed; pd.element.style.left = pd.x + 'px';
            if (pd.x < -50) { pd.element.remove(); window.Game.pads.splice(i, 1); continue; }
            if (cR > pd.x && cL < pd.x + pd.width && cB <= pd.bottom + pd.height + 4 && cT >= pd.bottom && (!window.Game.padCooldown || window.Game.padCooldown === 0)) {
                let bouncePower = window.Game.JUMP_CUBE * 1.15;
                if (pd.type === 'pad-pink') bouncePower = window.Game.JUMP_CUBE * 0.8;
                if (pd.type === 'pad-red') bouncePower = window.Game.JUMP_CUBE * 1.6;
                window.Game.cubeVelocityY = bouncePower; window.Game.isGrounded = false;
                window.Game.targetRotation += 180; window.Game.rotationSpeed = 180 / Math.abs((2 * bouncePower) / window.Game.GRAVITY_CUBE);
                window.AudioEngine.playPortalSound(); window.Game.padCooldown = 15; 
            }
        }
// js/physics.js - Часть 4 из 4
        for (let i = window.Game.portals.length - 1; i >= 0; i--) {
            const prt = window.Game.portals[i]; prt.x -= finalMovementSpeed; prt.element.style.left = prt.x + 'px';
            prt.element.style.backgroundImage = "url('/assets/images/portal.png')";
            if (prt.x < -50) { prt.element.remove(); window.Game.portals.splice(i, 1); continue; }
            if (cR > prt.x && cL < prt.x + prt.width && cB < prt.bottom + prt.height && cT > prt.bottom) {
                window.AudioEngine.playPortalSound(); prt.element.remove(); window.Game.portals.splice(i, 1);
                if (window.Game.currentMode === 'cube') { window.Game.currentMode = 'ship'; } 
                else { window.Game.currentMode = 'cube'; window.Game.targetRotation = Math.round(window.Game.rotation / 90) * 90; } if (window.Game.applySkin) window.Game.applySkin(); } }
        
        for (let i = window.Game.speedPortals.length - 1; i >= 0; i--) { 
            const sp = window.Game.speedPortals[i]; sp.x -= finalMovementSpeed; sp.element.style.left = sp.x + 'px'; 
            sp.element.style.backgroundImage = "url('/assets/images/speed.png')";
            if (sp.x < -50) { sp.element.remove(); window.Game.speedPortals.splice(i, 1); continue; } 
            let portalWidth = 25; let portalHeight = 100; let portalBottom = parseInt(sp.element.style.bottom || sp.bottom || 50, 10); let portalTop = portalBottom + portalHeight;
            let isCollidingX = (cR >= sp.x && cL <= sp.x + portalWidth) || (cR + finalMovementSpeed >= sp.x && cL - finalMovementSpeed <= sp.x + portalWidth);
            let isCollidingY = (cT >= portalBottom && cB <= portalTop);
            if (isCollidingX && isCollidingY) { 
                window.AudioEngine.playPortalSound(); if (sp.type.includes('slow')) window.Game.currentSpeedMultiplier = 0.65; else if (sp.type.includes('fast')) window.Game.currentSpeedMultiplier = 1.5; else window.Game.currentSpeedMultiplier = 1.0; sp.element.remove(); window.Game.speedPortals.splice(i, 1);
            } 
        }
        let insideAnyOrb = false; for (let i = window.Game.orbs.length - 1; i >= 0; i--) { const ob = window.Game.orbs[i]; ob.x -= finalMovementSpeed; ob.element.style.left = ob.x + 'px'; if (ob.x < -50) { ob.element.remove(); window.Game.orbs.splice(i, 1); continue; } if (cR > ob.x && cL < ob.x + ob.width && cB < ob.bottom + ob.height && cT > ob.bottom) { insideAnyOrb = true; window.Game.activeOrbIndex = i; } } window.Game.isInsideOrb = insideAnyOrb; if (!window.Game.isInsideOrb) window.Game.activeOrbIndex = -1;
        
        for (let i = window.Game.spikes.length - 1; i >= 0; i--) { 
            const spike = window.Game.spikes[i]; spike.x -= finalMovementSpeed; spike.element.style.left = spike.x + 'px'; 
            spike.element.style.backgroundImage = "url('/assets/images/spike.png')";
            
            let clipStyle = spike.type === 'spike-ceil' ? 'clip-path:polygon(0% 0%, 100% 0%, 50% 100%)' : 'clip-path:polygon(50% 0%, 0% 100%, 100% 100%)';
            this.drawHitboxDebug(spike.element, 'spike', 40, 40, clipStyle);

            if (spike.x < -50) { spike.element.remove(); window.Game.spikes.splice(i, 1); continue; } 
            if (cR > spike.x && cL < spike.x + spike.width && cT > spike.bottom && cB < spike.bottom + spike.height && window.Game.spawnProtectionFrames === 0) { 
                if (this.checkTriangleCollision(cL, cR, cB, cT, spike)) { window.MenuEngine.gameOver(); return; } 
            } 
        }
        // Если отображение хитбоксов выключено клавишей H, принудительно зачищаем все старые дебаг-рамки со сцены
        if (!window.Game.showHitboxes) { document.querySelectorAll('.debug-hitbox').forEach(h => h.remove()); }

        if (window.Game.animationFrameId) cancelAnimationFrame(window.Game.animationFrameId);
        window.Game.animationFrameId = requestAnimationFrame(() => this.update());
    },
    resetGame() {
        if (window.Game.animationFrameId) { cancelAnimationFrame(window.Game.animationFrameId); window.Game.animationFrameId = null; }
        window.Game.gameActive = false; this.clearGameContainer(); 
        window.Game.cubeY = 0; window.Game.cubeVelocityY = 0; window.Game.isGrounded = true; window.Game.rotation = 0; window.Game.targetRotation = 0; window.Game.currentMode = 'cube'; window.Game.currentSpeedMultiplier = 1.0; window.Game.spawnProtectionFrames = 15; window.Game.isHoldingAction = false; window.Game.isInsideOrb = false; window.Game.activeOrbIndex = -1; window.Game.padCooldown = 0;
        const liveCube = document.getElementById('cube'); if (liveCube) { liveCube.style.display = 'flex'; liveCube.style.transform = `translateY(0px) rotate(0deg)`; }
        window.Game.score = 0; window.Game.currentSpeed = window.Game.LEVEL_DATA[window.Game.currentLevel] ? window.Game.LEVEL_DATA[window.Game.currentLevel].speed : 5.5; window.Game.spawnTimer = 0; 
        const liveScore = document.getElementById('scoreVal'); if (liveScore) liveScore.textContent = '0'; 
        const liveProgFill = document.getElementById('progressBarFill'); if (liveProgFill) liveProgFill.style.width = '0%'; 
        const liveProgText = document.getElementById('progressText'); if (liveProgText) liveProgText.textContent = '0%'; 
        const liveOverScreen = document.getElementById('gameOverScreen'); if (liveOverScreen) liveOverScreen.style.display = 'none'; 
        
        if (window.Game.isTestingCustom) { 
            const liveStopBtn = document.getElementById('stopTestBtn'); if (liveStopBtn) liveStopBtn.style.display = 'block'; 
            const liveObjLayer = document.getElementById('objectsLayer');
            if (liveObjLayer) {
                let maxTargetX = 800; window.Game.customObjects.forEach(obj => { if (obj.x > maxTargetX) maxTargetX = obj.x; }); window.Game.levelMaxLength = maxTargetX + 200;
                window.Game.customObjects.forEach(obj => { 
                    const elClone = obj.element.cloneNode(true); elClone.style.display = 'block'; elClone.style.left = obj.x + 'px'; liveObjLayer.appendChild(elClone); 
                    if (obj.type === 'solid-block') { elClone.style.backgroundImage = "url('/assets/images/block.png')"; window.Game.solidBlocks.push({ element: elClone, x: parseInt(obj.x, 10), width: obj.width, height: obj.height, bottom: parseInt(obj.bottom, 10) }); }
                    else if (obj.type === 'spike-floor' || obj.type === 'spike-ceil') { elClone.style.backgroundImage = "url('/assets/images/spike.png')"; window.Game.spikes.push({ element: elClone, type: obj.type, x: parseInt(obj.x, 10), width: 40, height: 40, bottom: parseInt(obj.bottom, 10) }); } 
                    else if (obj.type === 'portal') { elClone.style.backgroundImage = "url('/assets/images/portal.png')"; window.Game.portals.push({ element: elClone, x: parseInt(obj.x, 10), width: obj.width, height: obj.height, bottom: parseInt(obj.bottom, 10) }); } 
                    else if (obj.type.startsWith('speed-')) { elClone.style.backgroundImage = "url('/assets/images/speed.png')"; window.Game.speedPortals.push({ element: elClone, x: parseInt(obj.x, 10), type: obj.type, width: 25, height: 100, bottom: parseInt(obj.bottom, 10) }); } 
                    else if (obj.type.startsWith('orb-')) window.Game.orbs.push({ element: elClone, type: obj.type, x: parseInt(obj.x, 10), width: 30, height: 30, bottom: parseInt(obj.bottom, 10) }); 
                    else if (obj.type.startsWith('pad-')) window.Game.pads.push({ element: elClone, type: obj.type, x: parseInt(obj.x, 10), width: 34, height: 12, bottom: parseInt(obj.bottom, 10) }); 
                }); 
            }
        }
        window.Game.gameActive = true; 
        if (window.Game.toggleSkins && window.Game.applySkin) window.Game.applySkin();
        if (window.AudioEngine) window.AudioEngine.startMusic();
        if (window.Game.animationFrameId) cancelAnimationFrame(window.Game.animationFrameId);
        window.Game.animationFrameId = requestAnimationFrame(() => this.update());
    },
    clearGameContainer() { window.Game.gameActive = false; const liveObjLayer = document.getElementById('objectsLayer'); if (liveObjLayer) liveObjLayer.innerHTML = ''; document.querySelectorAll('.particle').forEach(p => p.remove()); window.Game.spikes = []; window.Game.portals = []; window.Game.speedPortals = []; window.Game.orbs = []; window.Game.pads = []; window.Game.solidBlocks = []; window.Game.particles = []; const liveContainer = document.getElementById('gameContainer'); if (liveContainer) { liveContainer.style.backgroundColor = '#0a0813'; liveContainer.style.filter = 'none'; } },
    initRestartSystem() { const liveRestartBtn = document.getElementById('restartBtn'); if (liveRestartBtn) { liveRestartBtn.replaceWith(liveRestartBtn.cloneNode(true)); document.getElementById('restartBtn').addEventListener('click', () => { const liveOverScreen = document.getElementById('gameOverScreen'); if (liveOverScreen) liveOverScreen.style.display = 'none'; this.resetGame(); }); } }
};
document.addEventListener("DOMContentLoaded", () => { setTimeout(() => window.PhysicsEngine.initRestartSystem(), 100); });
