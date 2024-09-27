import { renderList } from './render.js';
import { loadData } from './data.js';
import { playAll, stopAll } from './audio.js'; // Import global play/pause

// Load the initial data and render the list
loadData().then(() => {
  renderList();
});

const globalStopBtn = document.getElementById('global-stop-btn');
globalStopBtn.addEventListener('click', () => {
  stopAll(); // Stop all audio
});
