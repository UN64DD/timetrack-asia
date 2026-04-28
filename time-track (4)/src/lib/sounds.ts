
const tapSound = new Audio('/src/assets/tap.mp3');

export const playTap = () => {
  tapSound.currentTime = 0;
  tapSound.volume = 0.3;
  tapSound.play().catch(e => console.warn('Audio playback failed:', e));
};
