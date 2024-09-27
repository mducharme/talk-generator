import { data } from './data.js'; // Import data array
import { saveData } from './data.js'; // Import save function
import { captureFocus, restoreFocus } from './focus.js'; // Import focus management functions
import { availableVoices } from './voices.js'; // Import available voices
import { voiceStyles } from './voicestyles.js'; // Import voice styles and avatars

// Access the item list container from the DOM
const itemList = document.getElementById('item-list');

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// Debounced version of saveData
const debouncedSaveData = debounce(saveData, 600);


// Function to render the list with drag-and-drop functionality
export function renderList() {
  captureFocus(itemList);

  itemList.innerHTML = '';

  data.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.draggable = true;

    // Apply voice-specific styles and avatar
    const voiceStyle = voiceStyles[item.voice] || {};
    itemDiv.style.backgroundColor = voiceStyle.backgroundColor || '#ffffff'; // Default to white if no style
    itemDiv.style.color = voiceStyle.color || '#000000'; // Default to black text

    // Add avatar/icon for each voice
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    const avatarImg = document.createElement('img');
    avatarImg.src = voiceStyle.avatar || 'https://example.com/default-avatar.png'; // Fallback to a default avatar
    avatarImg.alt = `${item.voice} avatar`;
    avatarImg.className = 'avatar-img';
    avatarDiv.appendChild(avatarImg);

    // Drag and Drop event handlers
    itemDiv.ondragstart = () => {
      draggedItemIndex = index; // Store the index of the dragged item
      itemDiv.classList.add('dragging'); // Add dragging class for visual feedback
    };

    itemDiv.ondragend = () => {
      itemDiv.classList.remove('dragging'); // Remove dragging class when drop is finished
    };

    itemDiv.ondragover = (event) => {
      event.preventDefault(); // Allow the item to be dropped
    };

    itemDiv.ondrop = () => {
      reorderItems(draggedItemIndex, index); // Reorder the items when dropped
    };

    // Create contenteditable div for text input
    const textDiv = document.createElement('div');
    textDiv.contentEditable = true;
    textDiv.innerText = item.text;
    textDiv.className = 'text-editable';
    textDiv.setAttribute('aria-label', 'Editable text input');
    textDiv.setAttribute('role', 'textbox');
    textDiv.oninput = () => {
      updateItem(index, 'text', textDiv.innerText);
    };

    // Create editable input for the identifier (ID)
    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.value = item.id;
    idInput.className = 'id-input';
    idInput.oninput = () => {
      updateItem(index, 'id', idInput.value);
    };

    // Create select dropdown for voices
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
      updateItem(index, 'voice', voiceSelect.value); // Update the voice in the data

      // Get the new voice styles based on the selected voice
      const newVoiceStyle = voiceStyles[voiceSelect.value] || {};

      // Update the item's background color and text color
      itemDiv.style.backgroundColor = newVoiceStyle.backgroundColor || '#ffffff'; 
      itemDiv.style.color = newVoiceStyle.color || '#000000'; 

      // Update the avatar image
      avatarImg.src = newVoiceStyle.avatar || 'https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png'; 
    };

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      deleteItem(index);
    };

    // Create "Add New" button to add a new item after the current one
    const addNewBtn = document.createElement('button');
    addNewBtn.textContent = 'Add New';
    addNewBtn.className = 'add-new-btn';
    addNewBtn.onclick = () => {
      addNewItem(index, item.id);
    };

    // Append avatar first, then text and controls
    itemDiv.appendChild(avatarDiv); // Append the avatar first
    itemDiv.appendChild(textDiv);
    itemDiv.appendChild(idInput);
    itemDiv.appendChild(voiceSelect);
    itemDiv.appendChild(deleteBtn);
    itemDiv.appendChild(addNewBtn); // Append the "Add New" button

    // Append the item div to the itemList
    itemList.appendChild(itemDiv);
  });

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

// Helper function to generate unique identifiers based on current ID
function generateIdentifier(currentId) {
  const [part0, part1, part2] = currentId.split("-").map(Number); // Parse once

  let newPart2 = part2 + 1;
  let newPart1 = part1;
  let newPart0 = part0;

  if (newPart2 > 99) {
    newPart2 = 0;
    newPart1 += 1;
  }
  if (newPart1 > 99) {
    newPart1 = 0;
    newPart0 += 1;
  }

  // Return the new incremented ID
  return `${newPart0.toString().padStart(2, "0")}-${newPart1.toString().padStart(2, "0")}-${newPart2.toString().padStart(2, "0")}`;
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