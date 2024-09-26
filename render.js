// render.js

import { data } from './data.js'; // Import data array
import { saveData } from './data.js'; // Import save function
import { captureFocus, restoreFocus } from './focus.js'; // Import focus management functions
import { availableVoices } from './voices.js';

// Access the item list container from the DOM
const itemList = document.getElementById('item-list');

// Function to render the list with drag-and-drop functionality
export function renderList() {
  captureFocus(); // Capture the current focus before rendering

  itemList.innerHTML = ''; // Clear the current list

  data.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.draggable = true;

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
      saveData(data); // Auto-save after reordering
    };

    // Create contenteditable div for text input
    const textDiv = document.createElement('div');
    textDiv.contentEditable = true;
    textDiv.innerText = item.text;
    textDiv.className = 'text-editable';
    textDiv.oninput = () => {
      updateItem(index, 'text', textDiv.innerText); // Update the text value
      saveData(data); // Auto-save after text changes
    };

    // Create editable input for the identifier (ID)
    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.value = item.id;
    idInput.className = 'id-input';
    idInput.oninput = () => {
      updateItem(index, 'id', idInput.value); // Update the ID value
      saveData(data); // Auto-save after ID changes
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
      updateItem(index, 'voice', parseInt(voiceSelect.value)); // Update the voice selection
      saveData(data); // Auto-save after voice changes
    };

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      deleteItem(index); // Delete the item
      saveData(data); // Auto-save after deletion
    };

    // Append elements to the item div
    itemDiv.appendChild(textDiv);
    itemDiv.appendChild(idInput);
    itemDiv.appendChild(voiceSelect);
    itemDiv.appendChild(deleteBtn);

    // Append the item div to the itemList
    itemList.appendChild(itemDiv);
  });

  restoreFocus(); // Restore focus after rendering
}

// Function to update item in data array
export function updateItem(index, field, value) {
  data[index][field] = value;
}

// Function to add a new item
export function addNewItem() {
  const newId = generateIdentifier(); // Generate a unique identifier for the new item
  data.push({ id: newId, text: '', voice: availableVoices[0].id }); // Default to the first available voice ID
  renderList(); // Re-render the list
  saveData(data); // Save after adding new item
}

// Function to delete an item
export function deleteItem(index) {
  data.splice(index, 1); // Remove the item from the data array
  renderList(); // Re-render the list
  saveData(data); // Save after deleting an item
}

// Helper function to generate unique identifiers
function generateIdentifier() {
  const lastItem = data[data.length - 1];
  const lastId = lastItem ? lastItem.id : "0-00-00";
  const parts = lastId.split("-").map(Number);

  // Increment the identifier (e.g., "0-00-01" becomes "0-00-02")
  parts[2] = parts[2] + 1;
  if (parts[2] > 99) {
    parts[2] = 0;
    parts[1] += 1;
  }
  if (parts[1] > 99) {
    parts[1] = 0;
    parts[0] += 1;
  }

  return `${parts[0].toString().padStart(2, "0")}-${parts[1].toString().padStart(2, "0")}-${parts[2].toString().padStart(2, "0")}`;
}

// Function to reorder items after drag-and-drop
function reorderItems(fromIndex, toIndex) {
  const movedItem = data.splice(fromIndex, 1)[0]; // Remove the dragged item
  data.splice(toIndex, 0, movedItem); // Insert the dragged item at the new position
  renderList(); // Re-render the list to reflect changes
}
