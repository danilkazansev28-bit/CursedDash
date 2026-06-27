// js/main.js - Часть 1 из 4
import './state.js';
import './audio.js';
import './testNormal.js';
import './testCustom.js';
import './effects.js';
import './physics.js';
import './editor.js';

window.MenuEngine = {
    initDOMRefs() {
        window.Game.DOM = { 
            container: document.getElementById('gameContainer'), 
            objectsLayer: document.getElementById('objectsLayer'), 
            cube: document.getElementById('cube'), 
            scoreVal: document.getElementById('scoreVal'), 
            finalScore: document.getElementById('finalScore'), 
            gameOverScreen: document.getElementById('gameOverScreen'), 
            restartBtn: document.getElementById('restartBtn'), 
            mainMenuScreen: document.getElementById('mainMenuScreen'), 
            editorPanel: document.getElementById('editorPanel'), 
            editorLeftPanel: document.getElementById('editorLeftPanel'),
            skinSelectScreen: document.getElementById('skinSelectScreen'), 
            stopTestBtn: document.getElementById('stopTestBtn'), 
            levelsListContainer: document.getElementById('levelsListContainer'), 
            progressBarContainer: document.getElementById('progressBarContainer'), 
            progressBarFill: document.getElementById('progressBarFill'), 
            progressText: document.getElementById('progressText')
        };
    },

    switchScreen(activeScreenKey) {
        this.initDOMRefs();
        const allScreens = {
            mainMenu: window.Game.DOM.mainMenuScreen,
            editor: window.Game.DOM.editorPanel,
            skins: window.Game.DOM.skinSelectScreen,
            gameOver: window.Game.DOM.gameOverScreen
        };

        for (let key in allScreens) {
            if (allScreens[key]) {
                allScreens[key].style.display = (key === activeScreenKey) ? 'flex' : 'none';
            }
        }
        if (window.Game.DOM.editorLeftPanel) {
            window.Game.DOM.editorLeftPanel.style.display = (activeScreenKey === 'editor') ? 'flex' : 'none';
        }
    },

    gameOver() { 
        this.switchScreen('gameOver');
        window.Game.gameActive = false; 
        if (window.Game.DOM.cube) window.Game.DOM.cube.style.display = 'none'; 
        window.AudioEngine.stopMusic(); 
        if (window.Game.isTestingCustom && window.Game.DOM.stopTestBtn) window.Game.DOM.stopTestBtn.style.display = 'none'; 
        window.AudioEngine.playDeathSound(); 
        if (window.EffectsEngine) window.EffectsEngine.createExplosion(150, 50 - window.Game.cubeY); 
        
        if (window.Game.isTestingCustom) { 
            if (window.Game.DOM.finalScore) window.Game.DOM.finalScore.textContent = Math.min(100, Math.floor((window.Game.score / window.Game.levelMaxLength) * 100)) + "%"; 
        } else { 
            if (window.Game.DOM.finalScore) window.Game.DOM.finalScore.textContent = Math.floor(window.Game.score) + " очков"; 
        } 
    },
// js/main.js - Часть 2 из 4
    renderSavedLevels() { 
        this.initDOMRefs(); 
        if (!window.Game.DOM.levelsListContainer) return; 
        window.Game.DOM.levelsListContainer.innerHTML = ''; 
        
        // Показываем черновики уровней только создателю-админу
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') !== 'mysecret123') {
            const title = document.getElementById('customLevelsTitle');
            if (title) title.style.display = 'none';
            return;
        }

        const levels = window.EditorEngine.getSavedLevels(); 
        if (levels.length === 0) { 
            window.Game.DOM.levelsListContainer.innerHTML = '<div style="font-size:12px; color:#55547a; text-align:center; padding:10px;">Нет черновиков</div>'; 
            return; 
        } 
        levels.forEach((lvl, idx) => { 
            const item = document.createElement('div'); 
            item.className = 'level-item'; 
            item.innerHTML = `<span>${lvl.name}</span><div class="level-item-btns"><button style="background:#00ff88; color:#111;" id="playCustom-${idx}">Играть</button><button style="background:#0f3460" id="editCustom-${idx}">Ред.</button><button style="background:#e94560" id="delCustom-${idx}">Х</button></div>`; 
            window.Game.DOM.levelsListContainer.appendChild(item); 
            
            document.getElementById(`playCustom-${idx}`).addEventListener('click', (e) => { e.stopPropagation(); this.loadAndPlayLevel(idx); }); 
            document.getElementById(`editCustom-${idx}`).addEventListener('click', (e) => { e.stopPropagation(); this.loadAndEditLevel(idx); }); 
            document.getElementById(`delCustom-${idx}`).addEventListener('click', (e) => { e.stopPropagation(); this.deleteLevel(idx); }); 
        }); 
    },
    deleteLevel(idx) { if (!confirm("Удалить уровень?")) return; const lvls = window.EditorEngine.getSavedLevels(); lvls.splice(idx, 1); localStorage.setItem('gd_custom_levels', JSON.stringify(lvls)); this.renderSavedLevels(); },
    loadAndPlayLevel(idx) { 
        this.initDOMRefs(); 
        const lvl = window.EditorEngine.getSavedLevels()[idx]; 
        window.Game.selectedTrackIndex = lvl.selectedTrackIndex !== undefined ? lvl.selectedTrackIndex : 0;
        
        window.Game.customObjects = lvl.objects.map(o => { 
            const el = document.createElement('div'); 
            if (o.type === 'solid-block') el.className = 'solid-block'; 
            else if (o.type === 'portal') el.className = 'portal'; 
            else if (o.type.startsWith('orb-')) el.className = `orb ${o.type}`; 
            else if (o.type.startsWith('pad-')) el.className = `pad ${o.type}`; 
            else if (o.type.startsWith('speed-')) el.className = `speed-portal ${o.type}`; 
            else { el.className = 'spike'; if (o.type === 'spike-ceil') el.style.transform = 'rotate(180deg)'; } 
            return { element: el, type: o.type, x: o.x, bottom: o.bottom, width: o.width, height: o.height }; 
        }); 
        window.MenuEngine.startCustomTest(); 
    },
    loadAndEditLevel(idx) { 
        this.initDOMRefs();
        const lvl = window.EditorEngine.getSavedLevels()[idx]; 
        window.Game.selectedTrackIndex = lvl.selectedTrackIndex !== undefined ? lvl.selectedTrackIndex : 0;
        
        window.Game.customObjects = lvl.objects.map(o => { 
            const el = document.createElement('div'); 
            if (o.type === 'solid-block') el.className = 'solid-block'; 
            else if (o.type === 'portal') el.className = 'portal'; 
            else if (o.type.startsWith('orb-')) el.className = `orb ${o.type}`; 
            else if (o.type.startsWith('pad-')) el.className = `pad ${o.type}`; 
            else if (o.type.startsWith('speed-')) el.className = `speed-portal ${o.type}`; 
            else { el.className = 'spike'; if (o.type === 'spike-ceil') el.style.transform = 'rotate(180deg)'; } 
            return { element: el, type: o.type, x: o.x, bottom: o.bottom, width: o.width, height: o.height }; 
        });
        window.Game.isTestingCustom = false; 
        window.EditorEngine.openEditor(); 
        if (window.Game.DOM.cube) window.Game.DOM.cube.style.display = 'none'; 
    },
// js/main.js - Часть 3 из 4
    startGame(lvl) { 
        this.switchScreen('none'); 
        window.Game.currentLevel = lvl; 
        window.Game.isTestingCustom = false; 
        window.Game.isEditorMode = false; 
        window.Game.isHoldingAction = false; 
        if (window.Game.DOM.scoreBoard) window.Game.DOM.scoreBoard.style.display = 'block'; 
        if (window.Game.DOM.progressBarContainer) window.Game.DOM.progressBarContainer.style.display = 'block'; 
        if (window.AudioEngine) window.AudioEngine.initAudio(); 
        
        this.initDOMRefs();
        window.PhysicsEngine.resetGame(); 
    },
    startCustomTest() { 
        this.switchScreen('none');
        window.Game.isEditorMode = false; 
        window.Game.isTestingCustom = true; 
        window.Game.isHoldingAction = false; 
        window.Game.currentLevel = 'custom'; 
        if (window.Game.DOM.scoreBoard) window.Game.DOM.scoreBoard.style.display = 'block'; 
        if (window.Game.DOM.stopTestBtn) window.Game.DOM.stopTestBtn.style.display = 'block'; 
        if (window.Game.DOM.progressBarContainer) window.Game.DOM.progressBarContainer.style.display = 'block'; 
        if (window.AudioEngine) window.AudioEngine.initAudio(); 
        
        this.initDOMRefs();
        window.PhysicsEngine.resetGame(); 
    },
    backToMenu() { 
        this.initDOMRefs(); 
        if (window.Game.DOM.scoreBoard) window.Game.DOM.scoreBoard.style.display = 'none'; 
        if (window.Game.DOM.stopTestBtn) window.Game.DOM.stopTestBtn.style.display = 'none'; 
        if (window.Game.DOM.progressBarContainer) window.Game.DOM.progressBarContainer.style.display = 'none'; 
        window.PhysicsEngine.clearGameContainer(); 
        window.Game.isHoldingAction = false;
        
        if (window.Game.isTestingCustom) { 
            window.Game.isTestingCustom = false; 
            window.EditorEngine.openEditor(); 
            if (window.Game.DOM.cube) window.Game.DOM.cube.style.display = 'none'; 
        } else { 
            window.Game.isEditorMode = false; 
            window.Game.customObjects.forEach(obj => { if(obj.element) obj.element.remove(); }); 
            window.Game.customObjects = []; 
            this.switchScreen('mainMenu');
            this.renderSavedLevels(); 
            window.AudioEngine.stopMusic(); 
            window.Game.gameActive = false; 
            if (window.Game.DOM.cube) window.Game.DOM.cube.style.display = 'flex'; 
        } 
    }
};
// js/main.js - Часть 4 из 4
document.addEventListener("DOMContentLoaded", () => {
    const gameBox = document.getElementById('gameContainer');
    if (gameBox && !document.getElementById('loadingScreen')) {
        const loadScreen = document.createElement('div'); loadScreen.id = 'loadingScreen';
        loadScreen.innerHTML = `<div class="loader-title">CURSED DASH</div><div class="loader-bar"><div id="loaderFill"></div></div><div id="loaderText">Загрузка ресурсов...</div>`;
        gameBox.appendChild(loadScreen);
    }

    window.MenuEngine.initDOMRefs(); window.EditorEngine.initEditorEvents(); window.MenuEngine.renderSavedLevels();
    
    // ПРОВЕРКА СОЗДАТЕЛЯ: Ищем параметр ?admin=mysecret123 в строке браузера
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'mysecret123') {
        // Открываем кнопку захода в редактор на главном экране
        const editorBtn = document.getElementById('btnOpenEditor'); if (editorBtn) editorBtn.style.display = 'block';
        const title = document.getElementById('customLevelsTitle'); if (title) title.style.display = 'block';
        // Открываем кнопку публикации выкладывания на левой панели редактора
        const publishBtn = document.getElementById('btnPublishOfficial'); if (publishBtn) publishBtn.style.display = 'block';
    }

    const preloadEverything = async () => {
        const images = ['block.png', 'cube.png', 'portal.png', 'ship.png', 'speed.png', 'spike.png'];
        const tracks = ['bozza.mp3', 'subscribe.mp3', 'bob.mp3'];
        const total = images.length + tracks.length; let loadedCount = 0;
        const updateBar = (name) => { loadedCount++; let pct = Math.floor((loadedCount / total) * 100); const fill = document.getElementById('loaderFill'); if(fill) fill.style.width = pct + '%'; };
        for(let img of images) { await new Promise(r => { const i = new Image(); i.src = `assets/images/${img}`; i.onload = () => { updateBar(img); r(); }; i.onerror = () => { updateBar(img); r(); }; }); }
        for(let track of tracks) { await new Promise(async (r) => { let trackLoaded = false; setTimeout(() => { if(!trackLoaded) r(); }, 600); try { if(window.AudioEngine && window.AudioEngine.loadTrackPromise) await window.AudioEngine.loadTrackPromise(track); } catch(err) {} trackLoaded = true; updateBar(track); r(); }); }
        setTimeout(() => { const ls = document.getElementById('loadingScreen'); if(ls) ls.remove(); window.MenuEngine.switchScreen('mainMenu'); }, 300);
    };
    preloadEverything();

    const bindClick = (id, action) => { try { const el = document.getElementById(id); if (el) el.addEventListener('click', (e) => { e.stopPropagation(); action(); }); } catch(e){} };
    bindClick('btnPlayLvl1', () => window.MenuEngine.startGame(1));
    bindClick('btnPlayLvl2', () => window.MenuEngine.startGame(2));
    bindClick('btnPlayLvl3', () => window.MenuEngine.startGame(3));
    bindClick('btnOpenEditor', () => { window.EditorEngine.openEditor(); if (window.Game.DOM.cube) window.Game.DOM.cube.style.display = 'none'; });
    bindClick('btnOpenSkins', () => window.MenuEngine.switchScreen('skins')); 
    bindClick('btnCloseSkins', () => window.MenuEngine.switchScreen('mainMenu')); 
    bindClick('btnStartTest', () => window.MenuEngine.startCustomTest());
    bindClick('btnSaveLevel', () => window.EditorEngine.saveCustomLevelPrompt());
    bindClick('btnClearLevel', () => window.EditorEngine.clearCustomLevel());
    bindClick('btnEditExit', () => window.MenuEngine.backToMenu());
    bindClick('btnEditorExit', () => window.MenuEngine.backToMenu());
    bindClick('btnGameOverExit', () => window.MenuEngine.backToMenu());
    if (window.Game.DOM.stopTestBtn) { window.Game.DOM.stopTestBtn.addEventListener('click', (e) => { e.stopPropagation(); window.MenuEngine.backToMenu(); }); }
    
    window.Game.toggleSkins = function(show) { window.MenuEngine.switchScreen(show ? 'skins' : 'mainMenu'); };
    window.Game.selectSkin = function(idx, el) { window.Game.selectedSkinIndex = idx; document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); window.Game.applySkin(); };
    window.Game.applySkin = function() { window.MenuEngine.initDOMRefs(); if (!window.Game.DOM.cube) return; window.Game.DOM.cube.style.backgroundColor = '#ffffff'; window.Game.DOM.cube.textContent = ''; window.Game.DOM.cube.style.display = 'flex'; };
    
    window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); if (window.Game.gameActive && !window.Game.isEditorMode) window.PhysicsEngine.pressAction(); } if (e.code === 'KeyH') { window.Game.showHitboxes = !window.Game.showHitboxes; } });
    window.addEventListener('keyup', (e) => { if (e.code === 'Space') { e.preventDefault(); if (window.Game.gameActive && !window.Game.isEditorMode) window.PhysicsEngine.releaseAction(); } });
    window.Game.DOM.container.addEventListener('mousedown', (e) => { if (!window.Game.gameActive || window.Game.isEditorMode) return; if (e.target.closest('button') || e.target.closest('#editorPanel') || e.target.closest('#editorLeftPanel') || e.target.closest('#mainMenuScreen') || e.target.closest('#gameOverScreen')) return; window.AudioEngine.initAudio(); window.PhysicsEngine.pressAction(); });
    window.addEventListener('mouseup', () => { if (window.Game.gameActive && !window.Game.isEditorMode) window.PhysicsEngine.releaseAction(); });
});
