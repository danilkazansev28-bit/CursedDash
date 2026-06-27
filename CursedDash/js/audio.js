// js/audio.js - Часть 1 из 2
if (!window.AudioEngine) {
    window.AudioEngine = {
        ctx: null,
        audioBuffers: {}, // Хранилище успешно загруженных треков

        // Функция прелоадера: если файла нет (404), она мягко пропускает его, не ломая игру!
        async loadTrackPromise(trackName) {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            try {
                const response = await fetch(`assets/audio/${trackName}`);
                if (!response.ok) throw new Error("404 Музыка не найдена");
                
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                this.audioBuffers[trackName] = audioBuffer;
                console.log(`Успешно загружен трек: ${trackName}`);
            } catch (err) {
                // ЖЕЛЕЗНЫЙ ФИКС: Если музыка выдала 404, мы просто ставим заглушку и не даем коду виснуть!
                this.audioBuffers[trackName] = null;
                console.warn(`Музыка ${trackName} отсутствует на Vercel (Заглушка активирована)`);
            }
        },

        initAudio() {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },
// js/audio.js - Часть 2 из 2
        startMusic() {
            this.initAudio();
            this.stopMusic();

            const currentTrack = window.Game.MUSIC_TRACKS[window.Game.selectedTrackIndex];
            if (!currentTrack) return;

            const buffer = this.audioBuffers[currentTrack.url];
            // Если буфер пустой (ошибка 404), мы просто выходим из функции, не зацикливая клики!
            if (!buffer) {
                window.Game.currentMusicFreq = 0;
                window.Game.bgPulseIntensity = 0;
                return;
            }

            try {
                this.source = this.ctx.createBufferSource();
                this.source.buffer = buffer;
                this.source.loop = true;

                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = 32;

                this.source.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
                this.source.start(0);

                // Запускаем безопасный расчет пульсации под музыку
                this.runAnalyserLoop();
            } catch (e) {
                console.error("Ошибка запуска аудио-узла:", e);
            }
        },

        stopMusic() {
            try {
                if (this.source) {
                    this.source.stop();
                    this.source.disconnect();
                    this.source = null;
                }
            } catch (e) {}
        },

        runAnalyserLoop() {
            if (!this.source || !this.analyser || !window.Game.gameActive) return;

            const data = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(data);

            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            let avg = sum / data.length;

            window.Game.currentMusicFreq = avg;
            window.Game.bgPulseIntensity = avg / 255;

            requestAnimationFrame(() => this.runAnalyserLoop());
        },

        // Полностью безопасные пустышки для звуков геймплея, чтобы они не вызывали ошибок
        playPortalSound() { console.log("Звук: Портал/Орб"); },
        playDeathSound() { console.log("Звук: Взрыв кубика"); }
    };
}
