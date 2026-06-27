// js/state.js
if (!window.Game) {
    window.Game = {
        gameActive: false,
        isEditorMode: false,
        isTestingCustom: false,
        currentLevel: 1,
        score: 0,
        currentSpeed: 5.5,
        currentSpeedMultiplier: 1.0,
        spawnTimer: 0,
        spawnProtectionFrames: 0,
        padCooldown: 0,
        
        cubeY: 0,
        cubeVelocityY: 0,
        isGrounded: true,
        isHoldingAction: false,
        isInsideOrb: false,
        activeOrbIndex: -1,
        
        rotation: 0,
        targetRotation: 0,
        rotationSpeed: 0,
        currentMode: 'cube', 
        
        // НАСТРОЙКА ХИТБОКСОВ: По умолчанию выключены, включаются по кнопке H
        showHitboxes: false,
        
        CUBE_SIZE: 40,
        GRAVITY_CUBE: -0.6,
        JUMP_CUBE: 8.8,
        GRAVITY_SHIP: -0.22,
        THRUST_SHIP: 0.42,
        
        solidBlocks: [],
        spikes: [],
        portals: [],
        speedPortals: [],
        orbs: [],
        pads: [],
        particles: [],
        customObjects: [],
        editorScrollX: 0,
        currentTool: 'spike-floor',
        isMouseOverPanel: false,
        levelMaxLength: 1000,
        
        selectedSkinIndex: 0,
        selectedTrackIndex: 0,
        
        bgPulseIntensity: 0,
        currentMusicFreq: 0,
        
        SKINS: [
            { bg: '#e94560', text: 'シ' },
            { bg: '#00bfff', text: '▲' },
            { bg: '#ffaa00', text: '⚡' }
        ],
        
        MUSIC_TRACKS: [
            { name: "bozza.mp3", url: "bozza.mp3" },
            { name: "subscribe.mp3", url: "subscribe.mp3" },
            { name: "bob.mp3", url: "bob.mp3" }
        ],
        
        LEVEL_DATA: {
            1: { speed: 5.0, melody: [130.81, 146.83, 164.81, 146.83] },
            2: { speed: 6.0, melody: [261.63, 293.66, 329.63, 349.23] },
            3: { speed: 7.0, melody: [196.00, 220.00, 196.00, 174.61] }
        },
        DOM: {}
    };
}
