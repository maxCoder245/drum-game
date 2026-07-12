// drumConfig.js
export const DRUM_ACTIONS = {
  36: 'ACTION_JUMP',        
  38: 'ACTION_SHOOT',       
  42: 'ACTION_LANE_LEFT',   
  51: 'ACTION_LANE_RIGHT'   
};
function handleDrumHit(event) {
  const [command, note, velocity] = event.data;
  
  // 153 is "Note On" for MIDI Channel 10
  if (command === 153 && velocity > 0) {
    const action = DRUM_ACTIONS[note]; // It will look up '36' here!
    
    if (action) {
      triggerGameAction(action, velocity);
    }
  }
}
// ... your existing DRUM_ACTIONS and handleDrumHit code ...

// This function asks the browser for permission and hooks up the listener
async function initMIDI() {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    
    for (const input of midiAccess.inputs.values()) {
      // This tells the browser: "Every time a MIDI message comes in, send it to handleDrumHit"
      input.onmidimessage = handleDrumHit;
    }
    
    console.log("MIDI Connected! Start hitting pads.");
    document.querySelector('h1').innerText = "MIDI Connected! Ready to play.";
    
  } catch (err) {
    console.error("Web MIDI access denied or not supported.", err);
    document.querySelector('h1').innerText = "MIDI Connection Failed.";
  }
}

// Kick off the connection process when the script loads
initMIDI();

// Dummy function so your code doesn't throw an error when a pad is hit
function triggerGameAction(action, velocity) {
    console.log(`Action triggered: ${action} with velocity ${velocity}`);
}
