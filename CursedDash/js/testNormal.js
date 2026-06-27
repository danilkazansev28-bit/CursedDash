// js/testNormal.js
if (!window.NormalLevelEngine) {
    window.NormalLevelEngine = {
        handleProgress(finalMovementSpeed, liveProgText, liveProgFill) {
            let pct = Math.min(100, Math.floor((window.Game.score / 15000) * 100));
            if (liveProgText) liveProgText.textContent = pct + "%"; 
            if (liveProgFill) liveProgFill.style.width = pct + "%";
            
            if (pct >= 100) { 
                window.Game.gameActive = false; 
                window.AudioEngine.stopMusic(); 
                setTimeout(() => { alert("Уровень пройден!"); window.MenuEngine.backToMenu(); }, 50); 
                return true; 
            }
            return false;
        },

        handleSpawning() {
            window.Game.spawnTimer++; 
            if (window.Game.spawnTimer > (Math.random() * 40 + 75) / window.Game.currentSpeedMultiplier) {
                const rand = Math.random(), startX = 850, liveObjLayer = document.getElementById('objectsLayer');
                if (liveObjLayer) {
                    if (rand < 0.1) {
                        const pEl = document.createElement('div'); pEl.className = 'portal'; pEl.style.left = startX + 'px'; pEl.style.bottom = (window.Game.currentMode === 'cube' ? '50px' : '150px'); liveObjLayer.appendChild(pEl); window.Game.portals.push({ element: pEl, x: startX, width: 35, height: 95, bottom: (window.Game.currentMode === 'cube' ? 50 : 150) });
                    } else if (rand < 0.16) {
                        const types = ['speed-slow', 'speed-normal', 'speed-fast'], t = types[Math.floor(Math.random() * 3)], spEl = document.createElement('div'); spEl.className = `speed-portal ${t}`; spEl.style.left = startX + 'px'; 
                        
                        // КРИТИЧЕСКИЙ ФИКС: Жестко прописываем координату bottom прямо в стили элемента, чтобы physics.js видел её как число!
                        spEl.style.bottom = '50px'; 
                        liveObjLayer.appendChild(spEl); 
                        
                        window.Game.speedPortals.push({ element: spEl, x: startX, type: t, width: 25, height: 100, bottom: 50 });
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
    };
}
