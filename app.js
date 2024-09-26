let data = [
];

// List of available voices with ID and label
const availableVoices = [
  { id: "fred", label: "Fred" },
  { id: "mat", label: "Mat" },
  { id: "narrator", label: "Narrator" },
  { id: "narrator2", label: "Narrator 2" }
];

const itemList = document.getElementById('item-list');
const addNewBtn = document.getElementById('add-new');
const saveJsonBtn = document.getElementById('save-json');
const jsonOutput = document.getElementById('json-output');

let draggedItemIndex = null; // Variable to store the index of the dragged item

// Function to generate a new identifier (e.g., "0-00-03")
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
// Function to render the list with drag-and-drop functionality using contenteditable divs
function renderList() {
  itemList.innerHTML = '';

  data.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.draggable = true; // Make the item draggable

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
      // Reorder the items when dropped
      reorderItems(draggedItemIndex, index);
    };

    // Create contenteditable div for text input
    const textDiv = document.createElement('div');
    textDiv.contentEditable = true;
    textDiv.innerText = item.text;
    textDiv.className = 'text-editable';
    textDiv.oninput = () => updateItem(index, 'text', textDiv.innerText);

    // Create editable input for the identifier (ID)
    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.value = item.id;
    idInput.className = 'id-input'; // Add some CSS to style it
    idInput.oninput = () => updateItem(index, 'id', idInput.value);

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

    voiceSelect.onchange = () => updateItem(index, 'voice', parseInt(voiceSelect.value));

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteItem(index);

    // Append elements to the item div
    itemDiv.appendChild(textDiv);
    itemDiv.appendChild(idInput);
    itemDiv.appendChild(voiceSelect);
    itemDiv.appendChild(deleteBtn);

    // Append the item div to the itemList
    itemList.appendChild(itemDiv);
  });
}

// Function to reorder items after drag-and-drop
function reorderItems(fromIndex, toIndex) {
  const movedItem = data.splice(fromIndex, 1)[0]; // Remove the dragged item
  data.splice(toIndex, 0, movedItem); // Insert the dragged item at the new position
  renderList(); // Re-render the list to reflect changes
}

// Function to update item in data array
function updateItem(index, field, value) {
  data[index][field] = value;
}

// Function to add a new item
function addNewItem() {
  const newId = generateIdentifier(); // Generate a unique identifier for the new item
  data.push({ id: newId, text: '', voice: availableVoices[0].id });  // Default to the first available voice ID
  renderList();
}

// Function to delete an item
function deleteItem(index) {
  data.splice(index, 1);
  renderList();
}

// Function to save the JSON with validation
function saveJson() {
  // Check for empty text fields
  let hasEmptyText = false;
  data.forEach((item, index) => {
    if (item.text.trim() === '') {
      hasEmptyText = true;
      alert(`Error: The text field for item ${index + 1} is empty!`);
    }
  });

  if (!hasEmptyText) {
    // If no empty text fields, proceed with saving
    const jsonData = JSON.stringify(data);

    // Send the data to the API using POST
    fetch('save.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonData,
    })
      .then(response => {
        if (response.ok) {
          alert('Data saved successfully!');
        } else {
          throw new Error('Failed to save data');
        }
      })
      .catch(error => {
        console.error('Error saving data:', error);
        alert('Error saving data.');
      });
  }
}

// Function to load data from the API
function loadData() {
  fetch('content.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      return response.json();
    })
    .then(jsonData => {
      data = jsonData;
      renderList(); // Render the list with the loaded data
    })
    .catch(error => {
      console.error('Error loading data:', error);
      alert('Error loading data.');
    });
}

// Event listeners
addNewBtn.addEventListener('click', addNewItem);
saveJsonBtn.addEventListener('click', saveJson);

// Initial load
loadData();
