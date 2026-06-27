// js/testNormal.js - Часть 1 из 4
if (!window.NormalLevelEngine) {
    window.NormalLevelEngine = {
        handleProgress(finalMovementSpeed, liveProgText, liveProgFill) {
            let pct = Math.min(100, Math.floor((window.Game.score / 15000) * 100));
            if (liveProgText) liveProgText.textContent = pct + "%"; 
            if (liveProgFill) liveProgFill.style.width = pct + "%";
            
            if (pct >= 100) { 
                window.Game.gameActive = false; 
                window.AudioEngine.stopMusic(); 
                if (window.PhysicsEngine && window.PhysicsEngine.clearGameContainer) {
                    window.PhysicsEngine.clearGameContainer();
                }
                setTimeout(() => { alert("Уровень пройден!"); window.MenuEngine.backToMenu(); }, 50); 
                return true; 
            }
            return false;
        },
// js/testNormal.js - Часть 2 из 4
        handleSpawning() {
            window.Game.spawnTimer++; 
            if (window.Game.spawnTimer > (Math.random() * 50 + 80) / window.Game.currentSpeedMultiplier) {
                const rand = Math.random(), startX = 850, liveObjLayer = document.getElementById('objectsLayer');
                if (liveObjLayer) {
                    if (rand < 0.1) {
                        const pEl = document.createElement('div'); 
                        pEl.className = 'portal'; 
                        pEl.style.left = startX + 'px'; 
                        pEl.style.bottom = (window.Game.currentMode === 'cube' ? '50px' : '150px');
                        pEl.style.backgroundImage = "url('/assets/images/portal.png')"; 
                        pEl.style.backgroundColor = 'transparent';
                        // ЖЕСТКИЙ ФИКС: Отключаем для элемента любую реакцию на мышь, чтобы он не вызывал прыжки!
                        pEl.style.pointerEvents = 'none'; 
                        
                        liveObjLayer.appendChild(pEl); 
                        window.Game.portals.push({ element: pEl, x: startX, width: 35, height: 95, bottom: (window.Game.currentMode === 'cube' ? 50 : 150) });
                    }
// js/testNormal.js - Часть 3 из 4
                    else if (rand < 0.16) {
                        const types = ['speed-slow', 'speed-normal', 'speed-fast'], t = types[Math.floor(Math.random() * 3)];
                        const spEl = document.createElement('div'); 
                        spEl.className = `speed-portal ${t}`; 
                        spEl.style.left = startX + 'px'; 
                        spEl.style.bottom = '50px'; 
                        spEl.style.backgroundImage = "url('/assets/images/speed.png')"; 
                        spEl.style.backgroundColor = 'transparent';
                        spEl.style.pointerEvents = 'none'; // Защита от фантомных кликов мыши
                        
                        liveObjLayer.appendChild(spEl); 
                        window.Game.speedPortals.push({ element: spEl, x: startX, type: t, width: 25, height: 100, bottom: 50 });
                    } 
                    else if (rand < 0.25) {
                        const types = ['orb-purple', 'orb-pink', 'orb-red'], t = types[Math.floor(Math.random() * 3)];
                        const oEl = document.createElement('div'); 
                        oEl.className = `orb ${t}`; 
                        oEl.style.left = startX + 'px'; 
                        const b = Math.random() * 80 + 100; 
                        oEl.style.bottom = b + 'px'; 
                        oEl.style.pointerEvents = 'none'; // Защита от фантомных кликов мыши
                        
                        liveObjLayer.appendChild(oEl); 
                        window.Game.orbs.push({ element: oEl, type: t, x: startX, width: 30, height: 30, bottom: b });
                    }
// js/testNormal.js - Часть 4 из 4
                    else if (rand < 0.35) {
                        const types = ['pad-yellow', 'pad-pink', 'pad-red'], t = types[Math.floor(Math.random() * 3)];
                        const pdEl = document.createElement('div'); 
                        pdEl.className = `pad ${t}`; 
                        pdEl.style.left = startX + 'px'; 
                        pdEl.style.bottom = '50px'; 
                        pdEl.style.pointerEvents = 'none'; // Защита от фантомных кликов мыши
                        
                        liveObjLayer.appendChild(pdEl); 
                        window.Game.pads.push({ element: pdEl, type: t, x: startX, width: 34, height: 12, bottom: 50 });
                    } 
                    else if (rand < 0.5) {
                        const bEl = document.createElement('div'); 
                        bEl.className = 'solid-block'; 
                        bEl.style.left = startX + 'px'; 
                        bEl.style.bottom = '90px'; 
                        bEl.style.backgroundImage = "url('/assets/images/block.png')"; 
                        bEl.style.backgroundColor = 'transparent';
                        bEl.style.pointerEvents = 'none'; // Защита от фантомных кликов мыши
                        
                        liveObjLayer.appendChild(bEl); 
                        window.Game.solidBlocks.push({ element: bEl, x: startX, width: 40, height: 40, bottom: 90 });
                    } 
                    else {
                        const spike = document.createElement('div'); 
                        spike.className = 'spike'; 
                        spike.style.left = startX + 'px'; 
                        spike.style.bottom = '50px'; 
                        spike.style.backgroundImage = "url('/assets/images/spike.png')"; 
                        spike.style.backgroundColor = 'transparent';
                        spike.style.pointerEvents = 'none'; // ГЛАВНЫЙ ФИКС: Шипы больше не принимают клики!
                        
                        liveObjLayer.appendChild(spike); 
                        window.Game.spikes.push({ element: spike, type: 'spike-floor', x: startX, width: 40, height: 40, bottom: 50 });
                    }
                }
                window.Game.spawnTimer = 0;
            }
        }
    };
}
