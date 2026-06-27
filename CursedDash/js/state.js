// js/state.js
if (!window.Game) window.Game = {};

window.Game.GRAVITY_CUBE = 0.4; 
window.Game.JUMP_CUBE = -11;
window.Game.GRAVITY_SHIP = 0.25; 
window.Game.THRUST_SHIP = -0.5; 
window.Game.CUBE_SIZE = 40;

window.Game.cubeY = 0; 
window.Game.cubeVelocityY = 0; 
window.Game.isGrounded = true;
window.Game.rotation = 0; 
window.Game.targetRotation = 0; 
window.Game.rotationSpeed = 0;

window.Game.currentMode = 'cube'; 
window.Game.currentSpeedMultiplier = 1.0;

window.Game.spikes = []; 
window.Game.portals = []; 
window.Game.speedPortals = [];
window.Game.orbs = []; 
window.Game.solidBlocks = []; 
window.Game.pads = []; 
window.Game.particles = [];

window.Game.gameActive = false; 
window.Game.score = 0; 
window.Game.spawnTimer = 0;
window.Game.currentSpeed = 5; 
window.Game.isHoldingAction = false; 
window.Game.currentLevel = 1;
window.Game.isEditorMode = false; 
window.Game.isTestingCustom = false; 
window.Game.customObjects = [];
window.Game.selectedSkinIndex = 0; 
window.Game.currentTool = 'spike-floor'; 
window.Game.isMouseOverPanel = false;
window.Game.isInsideOrb = false; 
window.Game.activeOrbIndex = -1; 
window.Game.spawnProtectionFrames = 0;
window.Game.levelMaxLength = 800; 
window.Game.editorScrollX = 0; 
window.Game.padCooldown = 0;

window.Game.selectedTrackIndex = 0;

// ТВОИ КАСТОМНЫЕ ТРЕКИ ДЛЯ ОТОБРАЖЕНИЯ В МЕНЮ СЛАЙДЕРА
window.Game.MUSIC_TRACKS = [
    { name: "1. Трек Bozza" },
    { name: "2. Subscribe" },
    { name: "3. Трек Bob" }
];

window.Game.LEVEL_DATA = {
    1: { speed: 5, melody: [130.81, 130.81, 164.81, 196.00, 164.81, 196.00, 220.00, 196.00] },
    2: { speed: 6.5, melody: [196.00, 220.00, 261.63, 293.66, 261.63, 293.66, 329.63, 293.66] },
    3: { speed: 8, melody: [329.63, 329.63, 392.00, 329.63, 440.00, 392.00, 329.63, 293.66] }
};

window.Game.SKINS = [
    { bg: '#e94560', text: '' }, 
    { bg: '#00bfff', text: '▲' }, 
    { bg: '#ffaa00', text: '⚡' }
];

window.Game.DOM = {};
