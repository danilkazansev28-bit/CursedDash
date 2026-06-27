/* js/physics.js - Часть 1 из 2 */
// ГАРАНТИРОВАННАЯ РЕГИСТРАЦИЯ: Создаем объект PhysicsEngine СРАЗУ, чтобы main.js никогда его не терял!
window.PhysicsEngine = {
    pressAction() { 
        if (!window.Game.gameActive || window.Game.isEditorMode) return; 
        if (window.Game.currentMode === 'cube' && !window.Game.isGrounded) {
            window.Game.isHoldingAction = false;
            return;
        }
        window.Game.isHoldingAction = true; 
        
        if (window.Game.isInsideOrb && window.Game.currentMode === 'cube') {
            let jumpPower = window.Game.JUMP_CUBE;
            if (window.Game.orbs[window.Game.activeOrbIndex]) {
                const type = window.Game.orbs[window.Game.activeOrbIndex].type;
                if (type === 'orb-pink') jumpPower = window.Game.JUMP_CUBE * 0.7;
                if (type === 'orb-red') jumpPower = window.Game.JUMP_CUBE * 1.4;
            }
            window.Game.cubeVelocityY = -jumpPower; 
            window.Game.isGrounded = false; 
            window.Game.isHoldingAction = false;
            window.Game.targetRotation += 180; 
            window.Game.rotationSpeed = 180 / Math.abs((2 * jumpPower) / window.Game.GRAVITY_CUBE); 
            if (window.AudioEngine) window.AudioEngine.playPortalSound(); 
            return;
        }
        
        if (window.Game.currentMode === 'cube' && window.Game.isGrounded) { 
            window.Game.cubeVelocityY = -window.Game.JUMP_CUBE; 
            window.Game.isGrounded = false; 
            window.Game.isHoldingAction = false;
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
        const shrinkX = 4; const shrinkY = 4; 
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
        if (!window.Game.showHitboxes) { debugDiv.style.display = 'none'; return; }
        debugDiv.style.cssText = `position:absolute; left:0; bottom:0; width:${width}px; height:${height}px; pointer-events:none; border:2px solid ${type === 'player' ? '#00ff88' : '#ff0055'}; background:${type === 'player' ? 'rgba(0,255,136,0.15)' : 'rgba(255,0,85,0.15)'}; z-index:9999; box-sizing:border-box; display:block; ${customStyle}`;
    },
/* js/physics.js - Часть 2 из 2 */
    update() {
        if (!window.Game.gameActive) return;
        
        if (window.Game.spawnProtectionFrames > 0) window.Game.spawnProtectionFrames--;
        if (window.Game.padCooldown > 0) window.Game.padCooldown--;

        if (window.Game.currentMode === 'cube') {
            window.Game.cubeVelocityY += Math.abs(window.Game.GRAVITY_CUBE); 
            window.Game.cubeY += window.Game.cubeVelocityY;
            
            if (window.Game.cubeY >= 0) { 
                window.Game.cubeY = 0; 
                window.Game.cubeVelocityY = 0; 
                window.Game.isGrounded = true; 
                window.Game.rotation = window.Game.targetRotation; 
                
                if (window.Game.isHoldingAction) {
                    window.Game.cubeVelocityY = -window.Game.JUMP_CUBE; 
                    window.Game.isGrounded = false; 
                    window.Game.isHoldingAction = false;
                    window.Game.targetRotation += 180; 
                    window.Game.rotationSpeed = 180 / Math.abs((2 * window.Game.JUMP_CUBE) / window.Game.GRAVITY_CUBE); 
                }
            } else { 
                window.Game.isGrounded = false; 
            }
            if (!window.Game.isGrounded && window.Game.rotation < window.Game.targetRotation) { 
                window.Game.rotation += window.Game.rotationSpeed; if (window.Game.rotation > window.Game.targetRotation) window.Game.rotation = window.Game.targetRotation; 
            }
        } else {
            if (window.Game.isHoldingAction) { window.Game.cubeVelocityY -= Math.abs(window.Game.THRUST_SHIP); } 
            else { window.Game.cubeVelocityY += Math.abs(window.Game.GRAVITY_SHIP); }
            window.Game.cubeVelocityY = Math.max(-6, Math.min(6, window.Game.cubeVelocityY)); 
            window.Game.cubeY += window.Game.cubeVelocityY;
            
            if (window.Game.cubeY >= 0) { window.Game.cubeY = 0; window.Game.cubeVelocityY = 0; }
            const ceilingY = -310; if (window.Game.cubeY <= ceilingY) { window.Game.cubeY = ceilingY; window.Game.cubeVelocityY = 0; }
            window.Game.rotation = window.Game.cubeVelocityY * 4;
        }
        
        const liveCube = document.getElementById('cube');
        if (liveCube) {
            liveCube.style.transform = `translateY(${window.Game.cubeY}px)`;
            liveCube.style.backgroundImage = `url("/assets/images/${window.Game.currentMode === 'cube' ? 'cube.png' : 'ship.png'}")`;
            let debugDiv = liveCube.querySelector('.debug-hitbox');
            if (debugDiv && window.Game.showHitboxes) { debugDiv.style.transform = `rotate(${window.Game.rotation}deg)`; } 
            else { liveCube.style.transform = `translateY(${window.Game.cubeY}px) rotate(${window.Game.rotation}deg)`; }
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

        window.Game.animationFrameId = requestAnimationFrame(() => this.update());
    },
    resetGame() {
        if (window.Game.animationFrameId) { cancelAnimationFrame(window.Game.animationFrameId); window.Game.animationFrameId = null; }
        window.Game.isHoldingAction = false; window.Game.gameActive = false; this.clearGameContainer(); 
        
        window.Game.cubeY = 0; window.Game.cubeVelocityY = 0; window.Game.isGrounded = true; window.Game.rotation = 0; window.Game.targetRotation = 0; window.Game.currentMode = 'cube'; window.Game.currentSpeedMultiplier = 1.0; window.Game.spawnProtectionFrames = 25; window.Game.isInsideOrb = false; window.Game.activeOrbIndex = -1; window.Game.padCooldown = 0;
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
        
        this.update();
    },
    clearGameContainer() { window.Game.gameActive = false; const liveObjLayer = document.getElementById('objectsLayer'); if (liveObjLayer) liveObjLayer.innerHTML = ''; document.querySelectorAll('.particle').forEach(p => p.remove()); window.Game.spikes = []; window.Game.portals = []; window.Game.speedPortals = []; window.Game.orbs = []; window.Game.pads = []; window.Game.solidBlocks = []; window.Game.particles = []; const liveContainer = document.getElementById('gameContainer'); if (liveContainer) { liveContainer.style.backgroundColor = '#0a0813'; liveContainer.style.filter = 'none'; } },
    initRestartSystem() { const liveRestartBtn = document.getElementById('restartBtn'); if (liveRestartBtn) { liveRestartBtn.replaceWith(liveRestartBtn.cloneNode(true)); document.getElementById('restartBtn').addEventListener('click', () => { const liveOverScreen = document.getElementById('gameOverScreen'); if (liveOverScreen) liveOverScreen.style.display = 'none'; this.resetGame(); }); } }
};
