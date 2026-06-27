// js/testCustom.js - Часть 1 из 4
if (!window.CustomTestEngine) {
    window.CustomTestEngine = {
        handleProgress(finalMovementSpeed, liveProgText, liveProgFill) {
            // Расчет процентов прохождения кастомного трека на основе его реальной длины
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
// js/testCustom.js - Часть 2 из 4
        handleSpawning() {
            // В режиме тестирования кастомной карты объекты берутся из массива customObjects
            const liveObjLayer = document.getElementById('objectsLayer');
            if (!liveObjLayer) return;

            let activeBaseSpeed = window.Game.LEVEL_DATA[window.Game.currentLevel] ? window.Game.LEVEL_DATA[window.Game.currentLevel].speed : 5.5;
            let finalMovementSpeed = activeBaseSpeed * window.Game.currentSpeedMultiplier;

            // Двигаем и обновляем кастомные объекты, которые расставил игрок
            window.Game.customObjects.forEach(obj => {
                if (obj.element && !obj.element.parentNode) {
                    obj.x -= finalMovementSpeed;
                    obj.element.style.left = obj.x + 'px';
                    
                    // КРИТИЧЕСКИЙ ФИКС: Защищаем кастомные объекты от мышиных нажатий!
                    obj.element.style.pointerEvents = 'none';
                    
                    // Синхронизируем текстурные пути
                    if (obj.type === 'solid-block') {
                        obj.element.style.backgroundImage = "url('/assets/images/block.png')";
                    } else if (obj.type === 'spike-floor' || obj.type === 'spike-ceil') {
                        obj.element.style.backgroundImage = "url('/assets/images/spike.png')";
                    } else if (obj.type === 'portal') {
                        obj.element.style.backgroundImage = "url('/assets/images/portal.png')";
                    } else if (obj.type.startsWith('speed-')) {
                        obj.element.style.backgroundImage = "url('/assets/images/speed.png')";
                    }
                    
                    // Добавляем объект на игровой экран, если он зашел в зону видимости
                    if (obj.x > -50 && obj.x < 900) {
                        liveObjLayer.appendChild(obj.element);
                    }
                } else if (obj.element) {
                    obj.x -= finalMovementSpeed;
                    obj.element.style.left = obj.x + 'px';
                    if (obj.x < -50) {
                        obj.element.remove();
                    }
                }
            });
        },
// js/testCustom.js - Часть 3 из 4
        loadObjectsForTest() {
            // Очищаем старые физические массивы перед заполнением новой карты
            window.Game.solidBlocks = [];
            window.Game.spikes = [];
            window.Game.portals = [];
            window.Game.speedPortals = [];
            window.Game.orbs = [];
            window.Game.pads = [];

            const liveObjLayer = document.getElementById('objectsLayer');
            if (!liveObjLayer) return;

            let maxTargetX = 800;
            window.Game.customObjects.forEach(obj => {
                if (obj.x > maxTargetX) maxTargetX = obj.x;
            });
            window.Game.levelMaxLength = maxTargetX + 200;

            window.Game.customObjects.forEach(obj => {
                if (!obj.element) return;
                
                // Сбрасываем стили отображения
                obj.element.style.display = 'block';
                obj.element.style.left = obj.x + 'px';
                obj.element.style.bottom = obj.bottom + 'px';
                
                // ЖЕСТКАЯ ЗАЩИТА: Отключаем клики мыши намертво
                obj.element.style.pointerEvents = 'none';
                
                liveObjLayer.appendChild(obj.element);

                // Распределяем элементы по физическим слоям движка
                if (obj.type === 'solid-block') {
                    obj.element.style.backgroundImage = "url('/assets/images/block.png')";
                    window.Game.solidBlocks.push(obj);
                } else if (obj.type === 'spike-floor' || obj.type === 'spike-ceil') {
                    obj.element.style.backgroundImage = "url('/assets/images/spike.png')";
                    // СУПЕР-ФИКС ПРОПОРЦИЙ: Задаем честные квадратные размеры хитбокса
                    obj.width = 40;
                    obj.height = 40;
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
// js/testCustom.js - Часть 4 из 4
        initCustomSession() {
            // Финальный триггер запуска сессии тестирования из редактора
            window.MenuEngine.initDOMRefs();
            window.Game.isHoldingAction = false; // Принудительный сброс вечного клика
            this.loadObjectsForTest();
        }
    };
}
