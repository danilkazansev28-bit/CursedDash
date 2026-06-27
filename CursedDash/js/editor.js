// js/editor.js - Часть 1 из 2
if (!window.EditorEngine) {
    window.EditorEngine = {
        openEditor() { 
            window.MenuEngine.initDOMRefs(); 
            window.Game.DOM.mainMenuScreen.style.display = 'none'; 
            window.Game.DOM.editorPanel.style.display = 'flex'; 
            window.Game.DOM.stopTestBtn.style.display = 'none'; 
            window.Game.DOM.progressBarContainer.style.display = 'none'; 
            window.Game.isEditorMode = true; 
            window.Game.isMouseOverPanel = false; 
            window.PhysicsEngine.clearGameContainer(); 
            
            // Динамически добавляем красивое текстовое поле для ввода MP3 ссылки в панель редактора, если его еще нет
            if (!document.getElementById('customMp3UrlInput')) {
                const inputEl = document.createElement('input');
                inputEl.id = 'customMp3UrlInput';
                inputEl.type = 'text';
                inputEl.placeholder = 'Вставь MP3-ссылку...';
                inputEl.style.cssText = 'background:#222; color:#fff; border:1px solid #555; padding:4px; font-size:10px; width:130px; margin:0 4px; border-radius:3px;';
                
                // Вставляем перед кнопкой "Тест"
                const testBtn = document.getElementById('btnStartTest');
                if (testBtn && testBtn.parentNode) {
                    testBtn.parentNode.insertBefore(inputEl, testBtn);
                }
            }
            
            // Если у текущего уровня уже есть ссылка, заполняем её в поле
            const inputField = document.getElementById('customMp3UrlInput');
            if (inputField) {
                inputField.value = window.Game.currentCustomMp3Url || '';
            }

            this.updateEditorView(); 
        },
        updateEditorView() { 
            window.Game.customObjects.forEach(obj => { 
                obj.element.style.left = (obj.x - window.Game.editorScrollX) + 'px'; 
                obj.element.style.bottom = obj.bottom + 'px'; 
                obj.element.style.display = 'block'; 
                window.Game.DOM.objectsLayer.appendChild(obj.element); 
            }); 
        },
        setTool(tool) {
            window.Game.currentTool = tool; 
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            const toolsMap = { 
                'spike-floor': 'toolSpikeFloor', 'spike-ceil': 'toolSpikeCeil', 'solid-block': 'toolBlock', 
                'portal': 'toolPortal', 'orb-purple': 'toolOrbPurple', 'orb-pink': 'toolOrbPink', 'orb-red': 'toolOrbRed', 
                'pad-yellow': 'toolPadYellow', 'pad-pink': 'toolPadPink', 'pad-red': 'toolPadRed', 
                'speed-slow': 'toolSlow', 'speed-normal': 'toolNorm', 'speed-fast': 'toolFast', 'eraser': 'toolEraser' 
            };
            if(toolsMap[tool]) document.getElementById(toolsMap[tool]).classList.add('active');
        },
        saveCustomLevelPrompt() { 
            if (window.Game.customObjects.length === 0) { alert("Нельзя сохранить пустой уровень!"); return; } 
            const name = prompt("Введите название уровня:", "Мой уровень " + (this.getSavedLevels().length + 1)); 
            if (!name) return; 
            
            // Запоминаем то, что пользователь ввёл в текстовое поле
            const inputField = document.getElementById('customMp3UrlInput');
            const mp3Url = inputField ? inputField.value.trim() : '';
            window.Game.currentCustomMp3Url = mp3Url;

            const levels = this.getSavedLevels();
            const dataToSave = window.Game.customObjects.map(o => ({ type: o.type, x: o.x, bottom: o.bottom, width: o.width, height: o.height })); 
            
            // Сохраняем ссылку на MP3 в общую память браузера рядом с объектами!
            levels.push({ name: name, objects: dataToSave, track: window.Game.selectedTrack, customMp3Url: mp3Url }); 
            localStorage.setItem('gd_custom_levels', JSON.stringify(levels)); 
            window.MenuEngine.renderSavedLevels(); 
            alert("Уровень сохранен вместе с кастомной музыкой!"); 
        },
// js/editor.js - Часть 2 из 2
        initEditorEvents() {
            window.MenuEngine.initDOMRefs();
            window.Game.DOM.editorPanel.addEventListener('mouseenter', () => { window.Game.isMouseOverPanel = true; }); 
            window.Game.DOM.editorPanel.addEventListener('mouseleave', () => { window.Game.isMouseOverPanel = false; });
            
            const scrLeft = document.getElementById('btnScrollLeft'), scrRight = document.getElementById('btnScrollRight');
            if(scrLeft) scrLeft.addEventListener('click', () => { window.Game.editorScrollX = Math.max(0, window.Game.editorScrollX - 120); this.updateEditorView(); });
            if(scrRight) scrRight.addEventListener('click', () => { window.Game.editorScrollX += 120; this.updateEditorView(); });
            
            window.Game.DOM.container.addEventListener('mousedown', (e) => {
                e.preventDefault(); 
                if (!window.Game.isEditorMode || window.Game.isMouseOverPanel || e.target === window.Game.DOM.stopTestBtn || e.target === window.Game.DOM.customTrackSelect || e.target.id === 'customMp3UrlInput' || e.target.closest('#editorPanel')) return;
                
                const rect = window.Game.DOM.container.getBoundingClientRect(); 
                let clickX = e.clientX - rect.left, clickY = e.clientY - rect.top, globalX = clickX + window.Game.editorScrollX;
                
                let snapX = parseInt(Math.floor(globalX / 40) * 40, 10); 
                let snapY = parseInt(Math.floor((400 - clickY) / 40) * 40, 10);
                
                if (window.Game.currentTool === 'eraser') { 
                    for (let i = window.Game.customObjects.length - 1; i >= 0; i--) { 
                        const obj = window.Game.customObjects[i]; 
                        if (Math.abs(obj.x - (clickX + window.Game.editorScrollX)) < 30 && Math.abs(obj.bottom - (400 - clickY)) < 30) { 
                            obj.element.remove(); window.Game.customObjects.splice(i, 1); break; 
                        } 
                    } return; 
                }
                
                const newEl = document.createElement('div'); 
                let type = window.Game.currentTool, width = 40, height = 40;
                
                if (type === 'portal') { width = 35; height = 95; newEl.classList.add('portal'); } 
                else if (type.startsWith('orb-')) { width = 30; height = 30; newEl.className = `orb ${type}`; } 
                else if (type.startsWith('pad-')) { width = 34; height = 12; newEl.className = `pad ${type}`; } 
                else if (type.startsWith('speed-')) { width = 25; height = 100; newEl.className = `speed-portal ${type}`; } 
                else if (type === 'solid-block') { newEl.classList.add('solid-block'); } 
                else if (type === 'spike-ceil') { width = 30; height = 40; newEl.classList.add('spike'); newEl.style.transform = 'rotate(180deg)'; } 
                else if (type === 'spike-floor') { width = 30; height = 40; newEl.classList.add('spike'); }
                
                newEl.style.left = (snapX - window.Game.editorScrollX) + 'px'; 
                newEl.style.bottom = snapY + 'px'; 
                window.Game.DOM.objectsLayer.appendChild(newEl);
                
                window.Game.customObjects.push({ element: newEl, type: type, x: snapX, bottom: snapY, width: parseInt(width, 10), height: parseInt(height, 10) });
            });
            
            window.Game.DOM.customTrackSelect.addEventListener('change', (e) => { 
                window.Game.selectedTrack = e.target.value; 
                if (window.Game.gameActive) window.AudioEngine.startMusic(); 
            });
        },
        getSavedLevels() { const data = localStorage.getItem('gd_custom_levels'); return data ? JSON.parse(data) : []; },
        clearCustomLevel() { window.Game.customObjects.forEach(obj => obj.element.remove()); window.Game.customObjects = []; }
    };
}
