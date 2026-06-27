/* js/testNormal.js - Часть 1 из 2 */
if (!window.NormalLevelEngine) {
    window.NormalLevelEngine = {
        // Базовая заготовка, если создатель еще ничего не построил
        DEFAULT_MAPS: {
            1: { 400: 'spike', 700: 'block', 1000: 'portal', 1400: 'spike' },
            2: { 400: 'block', 800: 'spike', 1200: 'portal', 1600: 'block' },
            3: { 300: 'spike', 600: 'spike', 900: 'speed-fast', 1300: 'portal' }
        },
        activePublishedMap: null,
        spawnedX: {},

        handleProgress(finalMovementSpeed, liveProgText, liveProgFill) {
            let maxLen = window.Game.levelMaxLength || 3500;
            let pct = Math.min(100, Math.floor((window.Game.score / maxLen) * 100));
            if (liveProgText) liveProgText.textContent = pct + "%"; 
            if (liveProgFill) liveProgFill.style.width = pct + "%";
            
            if (pct >= 100) { 
                window.Game.gameActive = false; 
                window.AudioEngine.stopMusic(); 
                if (window.PhysicsEngine && window.PhysicsEngine.clearGameContainer) window.PhysicsEngine.clearGameContainer();
                setTimeout(() => { alert("уровень пройден!"); window.MenuEngine.backToMenu(); }, 50); 
                return true; 
            }
            return false;
        },
/* js/testNormal.js - Часть 2 из 2 */
        handleSpawning() {
            const lvl = window.Game.currentLevel || 1;
            let currentX = Math.floor(window.Game.score);
            const liveObjLayer = document.getElementById('objectsLayer');
            if (!liveObjLayer) return;

            if (currentX < 10) { 
                this.spawnedX = {}; 
                // Считываем выложенный создателем уровень из хранилища браузера
                const savedData = localStorage.getItem(`gd_official_level_${lvl}`);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    this.activePublishedMap = {};
                    let maxTargetX = 800;
                    parsed.forEach(o => {
                        this.activePublishedMap[parseInt(o.x, 10)] = o;
                        if (o.x > maxTargetX) maxTargetX = o.x;
                    });
                    window.Game.levelMaxLength = maxTargetX + 400;
                } else {
                    this.activePublishedMap = null;
                    window.Game.levelMaxLength = 3500;
                }
            }

            let targetCheckX = currentX + 850;
            let snapCheckX = Math.floor(targetCheckX / 40) * 40; 

            // СЦЕНАРИЙ 1: Играем в уровень, который выложил Создатель
            if (this.activePublishedMap) {
                if (this.activePublishedMap[snapCheckX] && !this.spawnedX[snapCheckX]) {
                    const o = this.activePublishedMap[snapCheckX];
                    this.spawnedX[snapCheckX] = true;
                    const startX = 850;

                    const el = document.createElement('div');
                    if (o.type === 'solid-block') el.className = 'solid-block';
                    else if (o.type === 'portal') el.className = 'portal';
                    else if (o.type.startsWith('orb-')) el.className = `orb ${o.type}`;
                    else if (o.type.startsWith('pad-')) el.className = `pad ${o.type}`;
                    else if (o.type.startsWith('speed-')) el.className = `speed-portal ${o.type}`;
                    else { el.className = 'spike'; if (o.type === 'spike-ceil') el.style.transform = 'rotate(180deg)'; }

                    el.style.left = startX + 'px'; el.style.bottom = o.bottom + 'px'; el.style.pointerEvents = 'none';
                    liveObjLayer.appendChild(el);
                    
                    if (o.type === 'solid-block') window.Game.solidBlocks.push({ element: el, x: startX, width: 40, height: 40, bottom: o.bottom });
                    else if (o.type === 'spike-floor' || o.type === 'spike-ceil') window.Game.spikes.push({ element: el, type: o.type, x: startX, width: 40, height: 40, bottom: o.bottom });
                    else if (o.type === 'portal') window.Game.portals.push({ element: el, x: startX, width: 35, height: 95, bottom: o.bottom });
                    else if (o.type.startsWith('speed-')) window.Game.speedPortals.push({ element: el, x: startX, type: o.type, width: 25, height: 100, bottom: o.bottom });
                    else if (o.type.startsWith('orb-')) window.Game.orbs.push({ element: el, type: o.type, x: startX, width: 30, height: 30, bottom: o.bottom });
                    else if (o.type.startsWith('pad-')) window.Game.pads.push({ element: el, type: o.type, x: startX, width: 34, height: 12, bottom: o.bottom });
                }
            } 
            // СЦЕНАРИЙ 2: Если создатель еще не выложил карту, работает стандартная заготовка
            else {
                const defaultMap = this.DEFAULT_MAPS[lvl];
                if (defaultMap && defaultMap[snapCheckX] && !this.spawnedX[snapCheckX]) {
                    const type = defaultMap[snapCheckX]; this.spawnedX[snapCheckX] = true; const startX = 850;
                    const el = document.createElement('div'); el.style.left = startX + 'px'; el.style.bottom = '50px'; el.style.pointerEvents = 'none';
                    if (type === 'spike') { el.className = 'spike'; liveObjLayer.appendChild(el); window.Game.spikes.push({ element: el, type: 'spike-floor', x: startX, width: 40, height: 40, bottom: 50 }); }
                    else if (type === 'block') { el.className = 'solid-block'; el.style.bottom = '90px'; liveObjLayer.appendChild(el); window.Game.solidBlocks.push({ element: el, x: startX, width: 40, height: 40, bottom: 90 }); }
                    else if (type === 'portal') { el.className = 'portal'; liveObjLayer.appendChild(el); window.Game.portals.push({ element: el, x: startX, width: 35, height: 95, bottom: 50 }); }
                    else if (type.startsWith('speed-')) { el.className = `speed-portal ${type}`; liveObjLayer.appendChild(el); window.Game.speedPortals.push({ element: el, x: startX, type: type, width: 25, height: 100, bottom: 50 }); }
                }
            }
        }
    };
}
