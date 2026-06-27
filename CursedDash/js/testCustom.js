// js/testCustom.js
if (!window.CustomTestEngine) {
    window.CustomTestEngine = {
        handleProgress(finalMovementSpeed, liveProgText, liveProgFill) {
            let pct = Math.min(99, Math.floor((window.Game.score / window.Game.levelMaxLength) * 100));
            if (window.Game.score > window.Game.levelMaxLength) {
                pct = Math.min(100, 99 + Math.min(1, Math.floor((window.Game.score - window.Game.levelMaxLength) / 1000)));
            }
            if (liveProgText) liveProgText.textContent = pct + "%"; 
            if (liveProgFill) liveProgFill.style.width = pct + "%";
            return false; 
        },

        handleSpawning() {
            // В режиме тестирования кастомного уровня случайные преграды не спавнятся
        }
    };
}
