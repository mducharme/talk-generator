let isPlaying = false;
let currentIndex = -1;
let audioElements = [];
let highlightClass = 'playing-item';
let previousAudio = null;
const stopButton = document.getElementById('global-stop-btn'); // Reference to the stop button

// Play from the current item or resume from the last played item
export function playAll(startIndex = -1) {
  if (startIndex !== -1) {
    currentIndex = startIndex - 1; // Start from the provided index
  }
  if (isPlaying) return; // Avoid double play
  isPlaying = true;
  stopButton.style.display = 'block'; // Show the stop button when playback starts
  playNext();
}

// Stop all playing audios
export function stopAll() {
  isPlaying = false;
  audioElements.forEach(audio => {
    audio.pause();
    clearHighlight(audio); // Remove highlight from all items
  });
  currentIndex = -1;
  previousAudio = null;
  stopButton.style.display = 'none'; // Hide the stop button when playback stops
}

// Play the next audio in sequence
function playNext() {
  currentIndex += 1;

  if (currentIndex >= audioElements.length) {
    stopAll(); // End of list, so stop all audio
    return;
  }

  const audio = audioElements[currentIndex];
  
  // Remove the highlight from the previous item if it exists
  if (previousAudio) {
    clearHighlight(previousAudio);
  }

  if (audio && audio.src) {
    audio.play();
    highlightItem(audio); // Highlight current item
    scrollToItem(audio); // Scroll to the playing item
    previousAudio = audio; // Update the reference to the currently playing audio
    audio.onended = playNext; // When the current audio finishes, play the next
  } else {
    playNext(); // If no audio, skip to the next
  }
}

// Highlight the current playing item
function highlightItem(audio) {
  const parentItem = audio.closest('.item');
  if (parentItem) {
    parentItem.classList.add(highlightClass);
  }
}

// Remove highlight from an item
function clearHighlight(audio) {
  const parentItem = audio.closest('.item');
  if (parentItem) {
    parentItem.classList.remove(highlightClass);
  }
}

// Scroll to the current playing item
function scrollToItem(audio) {
  const parentItem = audio.closest('.item');
  if (parentItem) {
    parentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Function to set the audio elements from the rendered list
export function setAudioElements(elements) {
  audioElements = elements;
}


// Function to check if an audio file exists
export function checkAudioExists(itemId) {
  return fetch(`audio/${itemId}.mp3`, {
    method: 'HEAD',
  })
    .then(response => response.ok)
    .catch(() => false);
}

// Function to generate an audio file
export async function generateAudio(itemId) {
  try {
    const response = await fetch(`php/generate.php?id=${itemId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to generate audio');
    }
    return true; // Success
  } catch (error) {
    console.error('Error generating audio:', error);
    return false; // Failure
  }
}

