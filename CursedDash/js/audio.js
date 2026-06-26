// js/audio.js
import './state.js';

let audioCtx = null;
let musicInterval = null;
let musicStep = 0;

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
    },
    startMusic() {
        this.stopMusic(); musicStep = 0;
        musicInterval = setInterval(() => {
            if (window.Game.gameActive) {
                let m = window.Game.LEVEL_DATA[window.Game.currentLevel] 
                    ? window.Game.LEVEL_DATA[window.Game.currentLevel].melody 
                    : (window.Game.MUSIC_TRACKS[window.Game.selectedTrack] || window.Game.MUSIC_TRACKS["1"]);
                this.playMusicNote(m[musicStep]);
                musicStep = (musicStep + 1) % m.length;
            }
        }, 150);
    },
    stopMusic() { if (musicInterval) { clearInterval(musicInterval); musicInterval = null; } },
    playPortalSound() {
        if (!audioCtx) return;
        const gain = audioCtx.createGain(), o = audioCtx.createOscillator();
        o.connect(gain); gain.connect(audioCtx.destination); o.type = 'sine';
        o.frequency.setValueAtTime(300, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
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
