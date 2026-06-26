// js/main.js - Часть 1 из 4
import './state.js';
import './audio.js';
import './editor.js';
import './physics.js';

window.MenuEngine = {
    initDOMRefs() {
        if (window.Game.DOM && window.Game.DOM.mainMenuScreen) return;
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
            skinSelectScreen: document.getElementById('skinSelectScreen'),
            stopTestBtn: document.getElementById('stopTestBtn'),
            levelsListContainer: document.getElementById('levelsListContainer'),
            progressBarContainer: document.getElementById('progressBarContainer'),
            progressBarFill: document.getElementById('progressBarFill'),
            progressText: document.getElementById('progressText'),
            customTrackSelect: document.getElementById('customTrackSelect')
        };
    },

    gameOver() { 
        this.initDOMRefs(); 
        window.Game.gameActive = false; 
        if (window.Game.DOM.cube) window.Game.DOM.cube.style.display = 'none'; 
        window.AudioEngine.stopMusic(); 
        if (window.Game.isTestingCustom && window.Game.DOM.stopTestBtn) window.Game.DOM.stopTestBtn.style.display = 'none'; 
        window.AudioEngine.playDeathSound(); 
        window.PhysicsEngine.createExplosion(100, 50 - window.Game.cubeY); 
        
        if (window.Game.isTestingCustom) { 
            if (window.Game.DOM.finalScore) window.Game.DOM.finalScore.textContent = Math.min(100, Math.floor((window.Game.score / window.Game.levelMaxLength) * 100)) + "%"; 
        } else { 
            if (window.Game.DOM.finalScore) window.Game.DOM.finalScore.textContent = window.Game.score + " очков"; 
        } 
        if (window.Game.DOM.gameOverScreen) window.Game.DOM.gameOverScreen.style.display = 'flex'; 
    },
// js/main.js - Часть 2 из 4
    renderSavedLevels() {
        this.initDOMRefs(); 
        if (!window.Game.DOM.levelsListContainer) return; 
        window.Game.DOM.levelsListContainer.innerHTML = ''; 
        const levels = window.EditorEngine.getSavedLevels(); 
        if (levels.length === 0) { 
            window.Game.DOM.levelsListContainer.innerHTML = '<div style="font-size:12px; color:#55547a; text-align:center; padding:10px;">Нет сохраненных уровней</div>'; 
            return; 
        }
        levels.forEach((lvl, idx) => {
            const item = document.createElement('div'); 
            item.className = 'level-item'; 
            item.innerHTML = `<span>${lvl.name}</span><div class="level-item-btns"><button style="background:#00ff88; color:#111;" id="playCustom-${idx}">Играть</button><button style="background:#0f3460" id="editCustom-${idx}">Ред.</button><button style="background:#e94560" id="delCustom-${idx}">Х</button></div>`; 
            window.Game.DOM.levelsListContainer.appendChild(item);
            
            document.getElementById(`playCustom-${idx}`).addEventListener('click', () => this.loadAndPlayLevel(idx)); 
            document.getElementById(`editCustom-${idx}`).addEventListener('click', () => this.loadAndEditLevel(idx)); 
            document.getElementById(`delCustom-${idx}`).addEventListener('click', () => this.deleteLevel(idx));
        });
    },

    deleteLevel(idx) { 
        if (!confirm("Удалить уровень?")) return; 
        const lvls = window.EditorEngine.getSavedLevels(); 
        lvls.splice(idx, 1); 
        localStorage.setItem('gd_custom_levels', JSON.stringify(lvls)); 
        this.renderSavedLevels(); 
    },

    loadAndPlayLevel(idx) { 
        this.initDOMRefs(); 
        const lvl = window.EditorEngine.getSavedLevels()[idx]; 
        window.Game.selectedTrack = lvl.track || "1"; 
        if (window.Game.DOM.customTrackSelect) window.Game.DOM.customTrackSelect.value = window.Game.selectedTrack; 
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
        const lvl = window.EditorEngine.getSavedLevels()[idx]; 
        this.loadAndPlayLevel(idx); 
        window.Game.isTestingCustom = false; 
        window.EditorEngine.openEditor(); 
    },
// js/main.js - Часть 3 из 4
    startGame(lvl) { 
        this.initDOMRefs(); 
        window.Game.currentLevel = lvl; 
        window.Game.isTestingCustom = false; 
        window.Game.isEditorMode = false; 
        if (window.Game.DOM.mainMenuScreen) window.Game.DOM.mainMenuScreen.style.display = 'none'; 
        if (window.Game.DOM.scoreBoard) window.Game.DOM.scoreBoard.style.display = 'block'; 
        if (window.Game.DOM.progressBarContainer) window.Game.DOM.progressBarContainer.style.display = 'block'; 
        window.PhysicsEngine.resetGame(); 
    },

    startCustomTest() { 
        this.initDOMRefs(); 
        window.Game.isEditorMode = false; 
        if (window.Game.DOM.editorPanel) window.Game.DOM.editorPanel.style.display = 'none'; 
        window.Game.isTestingCustom = true; 
        window.Game.currentLevel = 'custom'; 
        if (window.Game.DOM.scoreBoard) window.Game.DOM.scoreBoard.style.display = 'block'; 
        if (window.Game.DOM.stopTestBtn) window.Game.DOM.stopTestBtn.style.display = 'block'; 
        if (window.Game.DOM.progressBarContainer) window.Game.DOM.progressBarContainer.style.display = 'block'; 
        window.PhysicsEngine.resetGame(); 
    },

    backToMenu() { 
        this.initDOMRefs(); 
        if (window.Game.DOM.gameOverScreen) window.Game.DOM.gameOverScreen.style.display = 'none'; 
        if (window.Game.DOM.scoreBoard) window.Game.DOM.scoreBoard.style.display = 'none'; 
        if (window.Game.DOM.stopTestBtn) window.Game.DOM.stopTestBtn.style.display = 'none'; 
        if (window.Game.DOM.editorPanel) window.Game.DOM.editorPanel.style.display = 'none'; 
        if (window.Game.DOM.progressBarContainer) window.Game.DOM.progressBarContainer.style.display = 'none'; 
        window.PhysicsEngine.clearGameContainer(); 
        if (window.Game.isTestingCustom) { 
            window.Game.isTestingCustom = false; 
            window.EditorEngine.openEditor(); 
        } else { 
            window.Game.isEditorMode = false; 
            window.Game.customObjects.forEach(obj => obj.element.remove()); 
            window.Game.customObjects = []; 
            if (window.Game.DOM.mainMenuScreen) window.Game.DOM.mainMenuScreen.style.display = 'flex'; 
            this.renderSavedLevels(); 
            window.AudioEngine.stopMusic(); 
            window.Game.gameActive = false; 
        } 
    }
};
// js/main.js - Часть 4 из 4
document.addEventListener("DOMContentLoaded", () => {
    window.MenuEngine.initDOMRefs(); 
    window.EditorEngine.initEditorEvents(); 
    window.MenuEngine.renderSavedLevels();
    
    document.getElementById('btnPlayLvl1').addEventListener('click', () => window.MenuEngine.startGame(1));
    document.getElementById('btnPlayLvl2').addEventListener('click', () => window.MenuEngine.startGame(2));
    document.getElementById('btnPlayLvl3').addEventListener('click', () => window.MenuEngine.startGame(3));
    document.getElementById('btnOpenEditor').addEventListener('click', () => window.EditorEngine.openEditor());
    document.getElementById('btnOpenSkins').addEventListener('click', () => window.Game.toggleSkins(true));
    document.getElementById('btnCloseSkins').addEventListener('click', () => window.Game.toggleSkins(false));
    document.getElementById('btnStartTest').addEventListener('click', () => window.MenuEngine.startCustomTest());
    document.getElementById('btnSaveLevel').addEventListener('click', () => window.EditorEngine.saveCustomLevelPrompt());
    document.getElementById('btnClearLevel').addEventListener('click', () => window.EditorEngine.clearCustomLevel());
    document.getElementById('btnEditorExit').addEventListener('click', () => window.MenuEngine.backToMenu());
    
    window.Game.DOM.stopTestBtn.addEventListener('click', () => window.MenuEngine.backToMenu());
    document.getElementById('btnGameOverExit').addEventListener('click', () => window.MenuEngine.backToMenu());

    document.getElementById('toolSpikeFloor').addEventListener('click', () => window.EditorEngine.setTool('spike-floor'));
    document.getElementById('toolSpikeCeil').addEventListener('click', () => window.EditorEngine.setTool('spike-ceil'));
    document.getElementById('toolBlock').addEventListener('click', () => window.EditorEngine.setTool('solid-block'));
    document.getElementById('toolPortal').addEventListener('click', () => window.EditorEngine.setTool('portal'));
    document.getElementById('toolOrbPurple').addEventListener('click', () => window.EditorEngine.setTool('orb-purple'));
    document.getElementById('toolOrbPink').addEventListener('click', () => window.EditorEngine.setTool('orb-pink'));
    document.getElementById('toolOrbRed').addEventListener('click', () => window.EditorEngine.setTool('orb-red'));
    document.getElementById('toolPadYellow').addEventListener('click', () => window.EditorEngine.setTool('pad-yellow'));
    document.getElementById('toolPadPink').addEventListener('click', () => window.EditorEngine.setTool('pad-pink'));
    document.getElementById('toolPadRed').addEventListener('click', () => window.EditorEngine.setTool('pad-red'));
    document.getElementById('toolSlow').addEventListener('click', () => window.EditorEngine.setTool('speed-slow'));
    document.getElementById('toolNorm').addEventListener('click', () => window.EditorEngine.setTool('speed-normal'));
    document.getElementById('toolFast').addEventListener('click', () => window.EditorEngine.setTool('speed-fast'));
    document.getElementById('toolEraser').addEventListener('click', () => window.EditorEngine.setTool('eraser'));

    window.Game.toggleSkins = function(show) {
        window.MenuEngine.initDOMRefs(); 
        window.Game.DOM.mainMenuScreen.style.display = show ? 'none' : 'flex'; 
        window.Game.DOM.skinSelectScreen.style.display = show ? 'flex' : 'none'; 
        if (!show) { window.Game.gameActive = false; window.Game.isEditorMode = false; window.MenuEngine.renderSavedLevels(); }
    };
    window.Game.selectSkin = function(idx, el) { window.Game.selectedSkinIndex = idx; document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('selected')); el.classList.add('selected'); };
    window.Game.applySkin = function() { 
        window.MenuEngine.initDOMRefs(); 
        if (!window.Game.DOM.cube) return;
        const s = window.Game.SKINS[window.Game.selectedSkinIndex]; 
        window.Game.DOM.cube.style.background = s.bg; 
        window.Game.DOM.cube.textContent = s.text; 
        window.Game.DOM.cube.style.display = 'flex'; 
        window.Game.DOM.cube.style.boxShadow = `0 0 15px ${s.bg}`; 
    };

    window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); window.PhysicsEngine.pressAction(); } });
    window.addEventListener('keyup', (e) => { if (e.code === 'Space') { e.preventDefault(); window.PhysicsEngine.releaseAction(); } });
    window.addEventListener('mousedown', (e) => {
        if (window.Game.isEditorMode) return;
        if (!e.target.closest('#editorPanel') && !e.target.closest('button')) { window.AudioEngine.initAudio(); window.PhysicsEngine.pressAction(); }
    });
    window.addEventListener('mouseup', () => { if (window.Game.gameActive && !window.Game.isEditorMode) window.PhysicsEngine.releaseAction(); });

    if (window.PhysicsEngine && window.PhysicsEngine.initRestartSystem) {
        window.PhysicsEngine.initRestartSystem();
    }
});
