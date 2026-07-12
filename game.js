// ==========================================
// 1. DRUM MAPPINGS (UPDATED CONTROLS)
// ==========================================
export const DRUM_ACTIONS = {
    36: 'ACTION_SHOOT',       // Kick -> Shoot
    38: 'ACTION_JUMP',        // Snare -> Jump (Move Up)
    
    // Open Hi-Hat -> Move Left
    46: 'ACTION_LANE_LEFT',   
    
    // Closed Hi-Hat (and pedal stomps) -> Move Right
    42: 'ACTION_LANE_RIGHT',   
    44: 'ACTION_LANE_RIGHT',   
    26: 'ACTION_LANE_RIGHT'    
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
        document.getElementById('statusText').style.display = 'none'; 
    } catch (err) {
        console.error("Web MIDI access denied or not supported.", err);
    }
}

function handleDrumHit(event) {
    const [command, note, velocity] = event.data;
    
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
const gravity = -0.15; 
let isJumping = false;

let currentLane = 0; 
const laneWidth = 2; 
let targetX = 0;     

// Array to hold all active lasers on screen
const lasers = [];

// ==========================================
// 5. GAME ACTION HANDLER
// ==========================================
function triggerGameAction(action, velocity) {
    
    // Jump (Now triggered by Snare)
    if (action === 'ACTION_JUMP' && !isJumping) {
        const jumpPower = (velocity / 127) * 0.5 + 0.8; 
        playerVelocityY = jumpPower;
        isJumping = true;
    } 
    
    // Shoot (Now triggered by Kick)
    else if (action === 'ACTION_SHOOT') {
        const laserGeo = new THREE.BoxGeometry(0.2, 0.2, 1.5);
        const laserMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); 
        const laser = new THREE.Mesh(laserGeo, laserMat);
        
        laser.position.set(player.position.x, player.position.y, player.position.z);
        scene.add(laser);
        lasers.push(laser); 
    }

    // Move Left (Now triggered by Open Hi-Hat)
    else if (action === 'ACTION_LANE_LEFT') {
        if (currentLane > -1) { 
            currentLane--;
            targetX = currentLane * laneWidth;
        }
    } 
    
    // Move Right (Now triggered by Closed Hi-Hat)
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
    
    // Handle Lane Shifting
    player.position.x += (targetX - player.position.x) * 0.15;
    
    // Handle Lasers (Fly forward)
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].position.z -= 1.0; 
        
        if (lasers[i].position.z < -60) {
            scene.remove(lasers[i]);
            lasers.splice(i, 1);
        }
    }
    
    // Scroll the track
    gridHelper.position.z += 0.3; 
    if (gridHelper.position.z > 2) {
        gridHelper.position.z = 0; 
    }
    
    renderer.render(scene, camera);
}

// Start the game loop
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
