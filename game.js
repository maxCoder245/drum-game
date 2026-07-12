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
