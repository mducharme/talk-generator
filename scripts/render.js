import { data, saveData } from './data.js';
import { captureFocus, restoreFocus } from './focus.js'; 
import { availableVoices } from './voices.js'; 
import { voiceStyles } from './voicestyles.js'; 
import { generateAudio, checkAudioExists, setAudioElements, playAll } from './audio.js';
import { debounce, generateIdentifier } from './utils.js';

const itemList = document.getElementById('item-list');
const totalDurationElement = document.getElementById('total-duration');
let audioElements = [];
let totalDuration = 0;


// Debounced version of saveData
const debouncedSaveData = debounce(saveData, 600);

export function renderList() {
  captureFocus(itemList);
  itemList.innerHTML = '';
  audioElements.length = 0; // Reset audio elements
  totalDuration = 0; // Reset total duration

  data.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.draggable = true;
    itemDiv.setAttribute('data-index', index); // Add index for drag-and-drop

    const voiceStyle = voiceStyles[item.voice] || {};
    itemDiv.style.backgroundColor = voiceStyle.backgroundColor || '#ffffff';
    itemDiv.style.color = voiceStyle.color || '#000000';

    // Handle drag-and-drop events
    itemDiv.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
    });

    itemDiv.addEventListener('dragover', (e) => {
      e.preventDefault(); // Allow dropping
    });

    itemDiv.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = e.dataTransfer.getData('text');
      const toIndex = index;
      reorderItems(fromIndex, toIndex);
    });

    // Avatar
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    const avatarImg = document.createElement('img');
    avatarImg.src = voiceStyle.avatar || 'https://example.com/default-avatar.png';
    avatarImg.alt = `${item.voice} avatar`;
    avatarImg.className = 'avatar-img';
    avatarDiv.appendChild(avatarImg);

    // Editable text
    const textDiv = document.createElement('div');
    textDiv.contentEditable = true;
    textDiv.innerText = item.text;
    textDiv.className = 'text-editable';
    textDiv.oninput = () => updateItem(index, 'text', textDiv.innerText);

    // ID input
    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.value = item.id;
    idInput.className = 'id-input';
    idInput.oninput = () => updateItem(index, 'id', idInput.value);

    // Voice selector
    const voiceSelect = document.createElement('select');
    availableVoices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.id;
      option.textContent = voice.label;
      if (item.voice === voice.id) {
        option.selected = true;
      }
      voiceSelect.appendChild(option);
    });
    voiceSelect.onchange = () => {
      updateItem(index, 'voice', voiceSelect.value);
      const newVoiceStyle = voiceStyles[voiceSelect.value] || {};
      itemDiv.style.backgroundColor = newVoiceStyle.backgroundColor || '#ffffff';
      itemDiv.style.color = newVoiceStyle.color || '#000000';
      avatarImg.src = newVoiceStyle.avatar || 'https://example.com/default-avatar.png';
    };

    // Generate MP3 button
    const generateBtn = document.createElement('button');
    generateBtn.textContent = 'Generate MP3';
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.style.display = 'none';
    checkAudioExists(item.id).then(exists => {
      if (exists) {
        audioElement.src = `audio/${item.id}.mp3`;
      }
      audioElement.addEventListener('loadedmetadata', () => {
        totalDuration += audioElement.duration;
        updateTotalDurationDisplay();
      });
    });
    audioElements.push(audioElement);
    generateBtn.onclick = async () => {
      await generateAudioForItem(generateBtn, audioElement, item.id);
    };

    // Play button
    const playBtn = document.createElement('button');
    playBtn.textContent = 'Play'; // Alternatively, 🎧, 🎶, 🔊, ⏯️
    playBtn.onclick = () => playAll(index);
    
    // Add New button (this will add a new item below the current one)
    const addNewBtn = document.createElement('button');
    addNewBtn.textContent = 'Add'; // Alternatively, 📝, 🆕, 📥
    addNewBtn.onclick = () => addNewItem(index, item.id);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-button';
    deleteBtn.textContent = 'Delete'; // Alternatively, ✂️, 🗙, 🗑️, or 🚫
    deleteBtn.onclick = () => deleteItem(index);


    // Append all elements
    itemDiv.appendChild(avatarDiv);
    itemDiv.appendChild(textDiv);
    itemDiv.appendChild(idInput);
    itemDiv.appendChild(voiceSelect);
    itemDiv.appendChild(generateBtn);
    itemDiv.appendChild(playBtn);
    itemDiv.appendChild(addNewBtn);
    itemDiv.appendChild(deleteBtn);
    itemDiv.appendChild(audioElement);
    itemList.appendChild(itemDiv);
  });

  setAudioElements(audioElements); // Set global audio elements for sequential play
  restoreFocus(itemList);
}


// Function to generate audio for an item and update the button/audio element
async function generateAudioForItem(generateBtn, audioElement, id) {
  const originalText = generateBtn.textContent;
  generateBtn.disabled = true;
  generateBtn.textContent = 'Loading...';

  try {
    const success = await generateAudio(id);
    if (success) {
      generateBtn.textContent = '✔ Success';
      audioElement.src = `audio/${id}.mp3`;
    } else {
      throw new Error('Failed to generate audio');
    }
  } catch (error) {
    generateBtn.textContent = '✖ Failed';
    console.error('Error generating MP3:', error);
  } finally {
    setTimeout(() => {
      generateBtn.textContent = originalText;
      generateBtn.disabled = false;
    }, 5000);
  }
}

// Function to update the total duration display
function updateTotalDurationDisplay() {
  const formattedDuration = formatDuration(totalDuration);
  totalDurationElement.textContent = `Total Talk Length: ${formattedDuration}`;
}

// Helper function to format the total duration into HH:MM:SS format
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Function to update item in data array
export function updateItem(index, field, value) {
  data[index][field] = value;
  debouncedSaveData(data); 
}

// Function to delete an item
function deleteItem(index) {
  data.splice(index, 1);
  renderList();
  debouncedSaveData(data); 
}

// Function to add a new item after a given index
export function addNewItem(afterIndex, currentId) {
  const newId = generateIdentifier(currentId); // Generate a unique identifier based on the current item ID
  const newItem = { id: newId, text: '', voice: availableVoices[0].id }; // Default to the first available voice ID

  data.splice(afterIndex + 1, 0, newItem);

  renderList();
  saveData(data);
}

// Function to reorder items after drag-and-drop
function reorderItems(fromIndex, toIndex) {
  const movedItem = data.splice(fromIndex, 1)[0]; // Remove the dragged item
  data.splice(toIndex, 0, movedItem); // Insert the dragged item at the new position

  const fromItem = document.querySelector(`.item[data-index="${fromIndex}"]`);
  const toItem = document.querySelector(`.item[data-index="${toIndex}"]`);

  // Reposition the DOM elements without re-rendering everything
  if (fromItem && toItem) {
    if (fromIndex < toIndex) {
      itemList.insertBefore(fromItem, toItem.nextSibling);
    } else {
      itemList.insertBefore(fromItem, toItem);
    }
  }

  saveData(data);
}