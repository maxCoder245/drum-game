// ==========================================
// 1. DRUM MAPPINGS
// ==========================================
export const DRUM_ACTIONS = {
    36: 'ACTION_JUMP',        // Kick
    38: 'ACTION_SHOOT',       // Snare
    42: 'ACTION_LANE_LEFT',   // Closed Hi-Hat
    51: 'ACTION_LANE_RIGHT'   // Ride
};

// ==========================================
// 2. MIDI CONNECTION LAYER
// ==========================================
async function initMIDI() {
    try {
        const midiAccess = await navigator.requestMIDIAccess();
        for (const input of midiAccess.inputs.values()) {
            input.onmidimessage = handleDrumHit;
        }
        console.log("MIDI Connected! Start hitting pads.");
        document.getElementById('statusText').style.display = 'none'; // Hide text once connected
    } catch (err) {
        console.error("Web MIDI access denied or not supported.", err);
    }
}

function handleDrumHit(event) {
    const [command, note, velocity] = event.data;
    
    // 153 is "Note On" for MIDI Channel 10
    if (command === 153 && velocity > 0) {
        const action = DRUM_ACTIONS[note];
        if (action) {
            triggerGameAction(action, velocity);
        }
    }
}

initMIDI();

// ==========================================
// 3. 3D ENGINE SETUP (THREE.JS)
// ==========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- The Track ---
const gridHelper = new THREE.GridHelper(100, 50, 0x00ffff, 0x222222);
scene.add(gridHelper);

// --- The Player (Hovercraft) ---
const geometry = new THREE.BoxGeometry(1, 0.5, 2);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const player = new THREE.Mesh(geometry, material);
player.position.y = 0.25; 
scene.add(player);

camera.position.set(0, 3, 6);
camera.lookAt(0, 0, -10);

// ==========================================
// 4. PHYSICS & GAME STATE 
// ==========================================
let playerVelocityY = 0;
const gravity = -0.15; // CHANGED: Was -0.04. This makes the craft fall MUCH faster
let isJumping = false;

// ... (lane variables stay the same) ...

// ==========================================
// 5. GAME ACTION HANDLER
// ==========================================
function triggerGameAction(action, velocity) {
    if (action === 'ACTION_JUMP' && !isJumping) {
        // CHANGED: Increased the base jump power to fight the heavier gravity
        const jumpPower = (velocity / 127) * 0.5 + 0.8; 
        playerVelocityY = jumpPower;
        isJumping = true;
    } 
    // ... (rest stays the same)
    // Hi-Hat logic (Move Left)
    else if (action === 'ACTION_LANE_LEFT') {
        if (currentLane > -1) { 
            currentLane--;
            targetX = currentLane * laneWidth;
        }
    } 
    // Ride Cymbal logic (Move Right)
    else if (action === 'ACTION_LANE_RIGHT') {
        if (currentLane < 1) { 
            currentLane++;
            targetX = currentLane * laneWidth;
        }
    }
}

// ==========================================
// 6. MAIN RENDER LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    // Handle Jump Physics
    if (isJumping) {
        player.position.y += playerVelocityY;
        playerVelocityY += gravity;
        
        if (player.position.y <= 0.25) {
            player.position.y = 0.25;
            isJumping = false;
            playerVelocityY = 0;
        }
    }
    
    // Handle Lane Shifting (Smooth Interpolation)
    player.position.x += (targetX - player.position.x) * 0.15;
    
    // Scroll the track
    gridHelper.position.z += 0.3; 
    if (gridHelper.position.z > 2) {
        gridHelper.position.z = 0; 
    }
    
    renderer.render(scene, camera);
}

// Start the game loop
animate();

// Handle window resizing cleanly
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
