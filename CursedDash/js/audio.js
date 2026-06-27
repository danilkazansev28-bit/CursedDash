// js/audio.js
import './state.js';

let audioCtx = null;
let musicInterval = null;
let externalAudioNode = null; 

window.AudioEngine = {
    initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        this.startMusic();
    },
    playMusicNote(freq) {
        if (!audioCtx || !window.Game.gameActive || freq === 0) return;
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = window.Game.currentMode === 'cube' ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
        window.Game.currentMusicFreq = freq;
        window.Game.bgPulseIntensity = 1.0; 
    },
    startMusic() {
        this.stopMusic(); 
        
        // ЕСЛИ ИГРАЕМ НА КАСТОМНОМ УРОВНЕ — ЗАПУСКАЕМ ТВОЙ НАСТОЯЩИЙ MP3 ФАЙЛ
        if (window.Game.currentLevel === 'custom') {
            // ТВОИ ТОЧНЫЕ ИМЕНА ЗАГРУЖЕННЫХ ФАЙЛОВ НА GITHUB
            const fileNames = [
                "bozza.mp3",     // Индекс 0
                "subscribe.mp3", // Индекс 1
                "bob.mp3"        // Индекс 2
            ];
            
            const selectedName = fileNames[window.Game.selectedTrackIndex] || "bozza.mp3";
            
            // Запускаем воспроизведение реального стерео-трека
            externalAudioNode = new Audio(selectedName);
            externalAudioNode.loop = true;
            externalAudioNode.volume = 0.45; 
            externalAudioNode.play().catch(err => console.log("Файл еще не загружен на GitHub или заблокирован:", err));
            
            // Эффекты неонового мерцания заднего фона в такт битам музыки
            musicInterval = setInterval(() => {
                if (window.Game.gameActive) {
                    window.Game.currentMusicFreq = Math.floor(Math.random() * 120 + 200);
                    window.Game.bgPulseIntensity = 1.0;
                }
            }, 250);
            return;
        }

        // Ноты для официальных уровней 1, 2, 3
        let musicStep = 0;
        musicInterval = setInterval(() => {
            if (window.Game.gameActive) {
                let m = window.Game.LEVEL_DATA[window.Game.currentLevel] ? window.Game.LEVEL_DATA[window.Game.currentLevel].melody : [130.81];
                this.playMusicNote(m[musicStep]);
                musicStep = (musicStep + 1) % m.length;
            }
        }, 150);
    },
    stopMusic() { 
        if (musicInterval) { clearInterval(musicInterval); musicInterval = null; } 
        if (externalAudioNode) { 
            try { externalAudioNode.pause(); externalAudioNode.currentTime = 0; } catch(e){}
            externalAudioNode = null; 
        }
        window.Game.currentMusicFreq = 0;
        window.Game.bgPulseIntensity = 0;
    },
    playPortalSound() {
        if (!audioCtx) return;
        const gain = audioCtx.createGain(), o = audioCtx.createOscillator();
        o.connect(gain); gain.connect(audioCtx.destination); o.type = 'sine';
        o.frequency.setValueAtTime(300, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(600, i => i + 0.2);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        o.start(); o.stop(audioCtx.currentTime + 0.2);
    },
    playDeathSound() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination); osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    }
};
