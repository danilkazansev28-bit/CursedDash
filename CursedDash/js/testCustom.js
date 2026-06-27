/* js/testCustom.js - Часть 1 из 2 */
if (!window.CustomTestEngine) {
    window.CustomTestEngine = {
        handleProgress(finalMovementSpeed, liveProgText, liveProgFill) {
            let pct = Math.min(100, Math.floor((window.Game.score / window.Game.levelMaxLength) * 100));
            if (liveProgText) liveProgText.textContent = pct + "%"; 
            if (liveProgFill) liveProgFill.style.width = pct + "%";
            
            if (pct >= 100) { 
                window.Game.gameActive = false; 
                window.AudioEngine.stopMusic(); 
                if (window.PhysicsEngine && window.PhysicsEngine.clearGameContainer) {
                    window.PhysicsEngine.clearGameContainer();
                }
                setTimeout(() => { alert("Кастомный уровень успешно пройден!"); window.MenuEngine.backToMenu(); }, 50); 
                return true; 
            }
            return false;
        },
/* js/testCustom.js - Часть 2 из 2 */
        handleSpawning() {
            const liveObjLayer = document.getElementById('objectsLayer');
            if (!liveObjLayer) return;

            let activeBaseSpeed = window.Game.LEVEL_DATA[window.Game.currentLevel] ? window.Game.LEVEL_DATA[window.Game.currentLevel].speed : 5.5;
            let finalMovementSpeed = activeBaseSpeed * window.Game.currentSpeedMultiplier;

            window.Game.customObjects.forEach(obj => {
                if (obj.element && !obj.element.parentNode) {
                    obj.x -= finalMovementSpeed;
                    obj.element.style.left = obj.x + 'px';
                    obj.element.style.pointerEvents = 'none';
                    
                    if (obj.type === 'solid-block') { obj.element.style.backgroundImage = "url('/assets/images/block.png')"; } 
                    else if (obj.type === 'spike-floor' || obj.type === 'spike-ceil') { obj.element.style.backgroundImage = "url('/assets/images/spike.png')"; } 
                    else if (obj.type === 'portal') { obj.element.style.backgroundImage = "url('/assets/images/portal.png')"; } 
                    else if (obj.type.startsWith('speed-')) { obj.element.style.backgroundImage = "url('/assets/images/speed.png')"; }
                    
                    if (obj.x > -50 && obj.x < 900) { liveObjLayer.appendChild(obj.element); }
                } else if (obj.element) {
                    obj.x -= finalMovementSpeed;
                    obj.element.style.left = obj.x + 'px';
                    if (obj.x < -50) { obj.element.remove(); }
                }
            });
        },
        loadObjectsForTest() {
            window.Game.solidBlocks = []; window.Game.spikes = []; window.Game.portals = []; window.Game.speedPortals = []; window.Game.orbs = []; window.Game.pads = [];
            const liveObjLayer = document.getElementById('objectsLayer'); if (!liveObjLayer) return;

            let maxTargetX = 800;
            window.Game.customObjects.forEach(obj => { if (obj.x > maxTargetX) maxTargetX = obj.x; });
            window.Game.levelMaxLength = maxTargetX + 200;

            window.Game.customObjects.forEach(obj => {
                if (!obj.element) return;
                obj.element.style.display = 'block';
                obj.element.style.left = obj.x + 'px';
                obj.element.style.bottom = obj.bottom + 'px';
                obj.element.style.pointerEvents = 'none';
                liveObjLayer.appendChild(obj.element);

                if (obj.type === 'solid-block') {
                    obj.element.style.backgroundImage = "url('/assets/images/block.png')";
                    window.Game.solidBlocks.push(obj);
                } else if (obj.type === 'spike-floor' || obj.type === 'spike-ceil') {
                    obj.element.style.backgroundImage = "url('/assets/images/spike.png')";
                    obj.width = 40; obj.height = 40;
                    window.Game.spikes.push(obj);
                } else if (obj.type === 'portal') {
                    obj.element.style.backgroundImage = "url('/assets/images/portal.png')";
                    window.Game.portals.push(obj);
                } else if (obj.type.startsWith('speed-')) {
                    obj.element.style.backgroundImage = "url('/assets/images/speed.png')";
                    window.Game.speedPortals.push(obj);
                } else if (obj.type.startsWith('orb-')) {
                    window.Game.orbs.push(obj);
                } else if (obj.type.startsWith('pad-')) {
                    window.Game.pads.push(obj);
                }
            });
        },
        initCustomSession() {
            window.MenuEngine.initDOMRefs();
            window.Game.isHoldingAction = false;
            this.loadObjectsForTest();
        }
    };
}
