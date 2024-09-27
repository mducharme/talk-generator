import { data, saveData } from './data.js';
import { captureFocus, restoreFocus } from './focus.js'; 
import { availableVoices } from './voices.js'; 
import { voiceStyles } from './voicestyles.js'; 
import { generateAudio, checkAudioExists, setAudioElements, playAll } from './audio.js';
import { debounce, generateIdentifier } from './utils.js';

const audioElements = [];

// Access the item list container from the DOM
const itemList = document.getElementById('item-list');

// Debounced version of saveData
const debouncedSaveData = debounce(saveData, 600);
export function renderList() {
  captureFocus(itemList);
  itemList.innerHTML = '';
  audioElements.length = 0; // Reset audio elements

  data.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.draggable = true;

    const voiceStyle = voiceStyles[item.voice] || {};
    itemDiv.style.backgroundColor = voiceStyle.backgroundColor || '#ffffff';
    itemDiv.style.color = voiceStyle.color || '#000000';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    const avatarImg = document.createElement('img');
    avatarImg.src = voiceStyle.avatar || 'https://example.com/default-avatar.png';
    avatarImg.alt = `${item.voice} avatar`;
    avatarImg.className = 'avatar-img';
    avatarDiv.appendChild(avatarImg);

    const textDiv = document.createElement('div');
    textDiv.contentEditable = true;
    textDiv.innerText = item.text;
    textDiv.className = 'text-editable';
    textDiv.oninput = () => updateItem(index, 'text', textDiv.innerText);

    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.value = item.id;
    idInput.className = 'id-input';
    idInput.oninput = () => updateItem(index, 'id', idInput.value);

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

    // Generate MP3 button with feedback
    const generateBtn = document.createElement('button');
    generateBtn.textContent = 'Generate MP3';

    // Create the audio element
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.style.display = 'none';

    // Check if MP3 exists, update audio element
    checkAudioExists(item.id).then(exists => {
      if (exists) {
        audioElement.src = `audio/${item.id}.mp3`;
     
      }
    });

    audioElements.push(audioElement); 

    // Generate MP3 button onclick logic
    generateBtn.onclick = async () => {
      const originalText = generateBtn.textContent; 
      generateBtn.disabled = true; 
      generateBtn.textContent = 'Loading...'; 

      try {
        const success = await generateAudio(item.id); 
        if (success) {
          generateBtn.textContent = '✔ Success'; 
          // Update the audio element with the newly generated MP3
          audioElement.src = `audio/${item.id}.mp3`;
        } else {
          throw new Error('Failed to generate audio');
        }
      } catch (error) {
        generateBtn.textContent = '✖ Failed'; 
        console.error('Error generating MP3:', error);
      } finally {
        // Reset the button text back to "Generate MP3" after 5 seconds
        setTimeout(() => {
          generateBtn.textContent = originalText;
          generateBtn.disabled = false; 
        }, 5000);
      }
    };

    const playBtn = document.createElement('button');
    playBtn.textContent = 'Play';
    playBtn.onclick = () => {
      playAll(index); // Start playing from this item and go sequentially
    };

    itemDiv.appendChild(avatarDiv);
    itemDiv.appendChild(textDiv);
    itemDiv.appendChild(idInput);
    itemDiv.appendChild(voiceSelect);
    itemDiv.appendChild(generateBtn);
    itemDiv.appendChild(playBtn);
    itemDiv.appendChild(audioElement);
    itemList.appendChild(itemDiv);
  });

  setAudioElements(audioElements); // Set global audio elements for sequential play
  restoreFocus(itemList);
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