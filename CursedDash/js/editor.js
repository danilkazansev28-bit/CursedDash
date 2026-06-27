/* js/editor.js - Часть 1 из 2 */
if (!window.EditorEngine) {
    window.EditorEngine = {
        openEditor() { 
            if (window.MenuEngine && window.MenuEngine.switchScreen) { window.MenuEngine.switchScreen('editor'); }
            window.Game.DOM.stopTestBtn.style.display = 'none'; 
            window.Game.DOM.progressBarContainer.style.display = 'none'; 
            window.Game.isEditorMode = true; window.Game.isMouseOverPanel = false; 
            window.PhysicsEngine.clearGameContainer(); 
            
            if (!document.getElementById('musicSliderContainer')) {
                const sliderContainer = document.createElement('div'); sliderContainer.id = 'musicSliderContainer';
                sliderContainer.style.cssText = 'display:flex; align-items:center; background:#1a1a24; border:1px solid #444; padding:4px; border-radius:4px; width:95px; box-sizing:border-box; justify-content:space-between;';
                const btnPrev = document.createElement('button'); btnPrev.textContent = '◀'; btnPrev.style.cssText = 'background:#333; color:#fff; border:none; font-size:9px; padding:2px 4px; cursor:pointer; border-radius:2px;';
                const trackNameLabel = document.createElement('span'); trackNameLabel.id = 'editorMusicTrackName'; trackNameLabel.style.cssText = 'color:#00ff88; font-size:9px; font-weight:bold; max-width:55px; overflow:hidden; text-overflow:ellipsis; text-align:center; display:inline-block; font-family:monospace; white-space:nowrap;';
                const btnNext = document.createElement('button'); btnNext.textContent = '▶'; btnNext.style.cssText = 'background:#333; color:#fff; border:none; font-size:9px; padding:2px 4px; cursor:pointer; border-radius:2px;';

                const updateTrackLabel = () => { const currentTrack = window.Game.MUSIC_TRACKS[window.Game.selectedTrackIndex]; trackNameLabel.textContent = currentTrack ? currentTrack.name : "Мьюзик"; };
                btnPrev.addEventListener('click', (e) => { e.stopPropagation(); window.Game.selectedTrackIndex = (window.Game.selectedTrackIndex - 1 + window.Game.MUSIC_TRACKS.length) % window.Game.MUSIC_TRACKS.length; updateTrackLabel(); });
                btnNext.addEventListener('click', (e) => { e.stopPropagation(); window.Game.selectedTrackIndex = (window.Game.selectedTrackIndex + 1) % window.Game.MUSIC_TRACKS.length; updateTrackLabel(); });
                sliderContainer.appendChild(btnPrev); sliderContainer.appendChild(trackNameLabel); sliderContainer.appendChild(btnNext);
                const leftPanel = document.getElementById('editorLeftPanel'); if (leftPanel) { leftPanel.appendChild(sliderContainer); }
                updateTrackLabel();
            } else {
                const label = document.getElementById('editorMusicTrackName'); if (label) label.textContent = window.Game.MUSIC_TRACKS[window.Game.selectedTrackIndex].name;
            }
            this.updateEditorView(); 
        },
        updateEditorView() { 
            window.Game.customObjects.forEach(obj => { 
                if (obj.element) {
                    obj.element.style.left = (obj.x - window.Game.editorScrollX) + 'px'; 
                    obj.element.style.bottom = obj.bottom + 'px'; 
                    obj.element.style.display = 'block'; 
                    window.Game.DOM.objectsLayer.appendChild(obj.element); 
                }
            }); 
        },
        setTool(tool) {
            window.Game.currentTool = tool; 
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            const toolsMap = { 
                'spike-floor': 'toolSpikeFloor', 'spike-ceil': 'toolSpikeCeil', 'solid-block': 'toolBlock', 
                'portal': 'toolPortal', 'orb-purple': 'toolOrbPurple', 'orb-pink': 'toolOrbPink', 'orb-red': 'toolOrbRed', 
                'pad-yellow': 'toolPadYellow', 'pad-pink': 'toolPink', 'pad-red': 'toolPadRed', 
                'speed-slow': 'toolSlow', 'speed-normal': 'toolNorm', 'speed-fast': 'toolFast', 'eraser': 'toolEraser' 
            };
            if(toolsMap[tool] && document.getElementById(toolsMap[tool])) { document.getElementById(toolsMap[tool]).classList.add('active'); }
        },
/* js/editor.js - Часть 2 из 2 */
        saveCustomLevelPrompt() { 
            if (window.Game.customObjects.length === 0) { alert("Нельзя сохранить пустой уровень!"); return; } 
            const name = prompt("Введите название уровня:", "Кастом " + (this.getSavedLevels().length + 1)); 
            if (!name) return; 
            const levels = this.getSavedLevels();
            const dataToSave = window.Game.customObjects.map(o => ({ type: o.type, x: o.x, bottom: o.bottom, width: o.width, height: o.height })); 
            levels.push({ name: name, objects: dataToSave, selectedTrackIndex: window.Game.selectedTrackIndex }); 
            localStorage.setItem('gd_custom_levels', JSON.stringify(levels)); 
            window.MenuEngine.renderSavedLevels(); 
            alert("Черновик успешно сохранен!"); 
        },
        getSavedLevels() { const data = localStorage.getItem('gd_custom_levels'); return data ? JSON.parse(data) : []; },
        clearCustomLevel() { window.Game.customObjects.forEach(obj => { if(obj.element) obj.element.remove(); }); window.Game.customObjects = []; },
        
        publishOfficialLevel() {
            if (window.Game.customObjects.length === 0) { alert("Нельзя выложить пустую карту!"); return; }
            const lvlNum = prompt("На место какого Официального Уровня выложить карту? (Введите число 1, 2 или 3):", "1");
            if (lvlNum !== "1" && lvlNum !== "2" && lvlNum !== "3") { alert("Введите только 1, 2 или 3!"); return; }
            
            const dataToPublish = window.Game.customObjects.map(o => ({ type: o.type, x: parseInt(o.x, 10), bottom: parseInt(o.bottom, 10), width: parseInt(o.width, 10), height: parseInt(o.height, 10) }));
            localStorage.setItem(`gd_official_level_${lvlNum}`, JSON.stringify(dataToPublish));
            alert(`Уровень успешно ОПУБЛИКОВАН на место Официального Уровня ${lvlNum}! Переходи на главную страницу и проверяй!`);
        },

        initEditorEvents() {
            window.MenuEngine.initDOMRefs();
            if (window.Game.DOM.editorPanel) {
                window.Game.DOM.editorPanel.addEventListener('mouseenter', () => { window.Game.isMouseOverPanel = true; }); 
                window.Game.DOM.editorPanel.addEventListener('mouseleave', () => { window.Game.isMouseOverPanel = false; });
            }
            const scrLeft = document.getElementById('btnScrollLeft'), scrRight = document.getElementById('btnScrollRight');
            if(scrLeft) scrLeft.addEventListener('click', (e) => { e.stopPropagation(); window.Game.editorScrollX = Math.max(0, window.Game.editorScrollX - 120); this.updateEditorView(); });
            if(scrRight) scrRight.addEventListener('click', (e) => { e.stopPropagation(); window.Game.editorScrollX += 120; this.updateEditorView(); });
            
            const pubBtn = document.getElementById('btnPublishOfficial'); if (pubBtn) pubBtn.addEventListener('click', () => this.publishOfficialLevel());

            window.Game.DOM.container.addEventListener('mousedown', (e) => {
                if (e.target.closest('button') || e.target.closest('#editorPanel') || e.target.closest('#editorLeftPanel')) return;
                if (!window.Game.isEditorMode || window.Game.isMouseOverPanel) return;
                e.preventDefault();
                
                const rect = window.Game.DOM.container.getBoundingClientRect(); 
                let clickX = e.clientX - rect.left, clickY = e.clientY - rect.top, globalX = clickX + window.Game.editorScrollX;
                let snapX = parseInt(Math.floor(globalX / 40) * 40, 10); let snapY = parseInt(Math.floor((400 - clickY) / 40) * 40, 10);
                
                if (window.Game.currentTool === 'eraser') { 
                    for (let i = window.Game.customObjects.length - 1; i >= 0; i--) { 
                        const obj = window.Game.customObjects[i]; 
                        if (Math.abs(obj.x - (clickX + window.Game.editorScrollX)) < 30 && Math.abs(obj.bottom - (400 - clickY)) < 30) { if(obj.element) obj.element.remove(); window.Game.customObjects.splice(i, 1); break; } 
                    } return; 
                }
                
                const newEl = document.createElement('div'); 
                let type = window.Game.currentTool, width = 40, height = 40;
                if (type === 'portal') { width = 35; height = 95; newEl.classList.add('portal'); } 
                else if (type.startsWith('orb-')) { width = 30; height = 30; newEl.className = `orb ${type}`; } 
                else if (type.startsWith('pad-')) { width = 34; height = 12; newEl.className = `pad ${type}`; } 
                else if (type.startsWith('speed-')) { width = 25; height = 100; newEl.className = `speed-portal ${type}`; } 
                else if (type === 'solid-block') { newEl.classList.add('solid-block'); } 
                else if (type === 'spike-ceil') { width = 40; height = 40; newEl.classList.add('spike'); newEl.style.transform = 'rotate(180deg)'; } 
                else if (type === 'spike-floor') { width = 40; height = 40; newEl.classList.add('spike'); }
                
                newEl.style.left = (snapX - window.Game.editorScrollX) + 'px'; newEl.style.bottom = snapY + 'px'; 
                window.Game.DOM.objectsLayer.appendChild(newEl);
                window.Game.customObjects.push({ element: newEl, type: type, x: snapX, bottom: snapY, width: parseInt(width, 10), height: parseInt(height, 10) });
            });
        }
    };
}
