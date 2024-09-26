import { renderList, addNewItem } from './render.js';
import { loadData } from './data.js';

const addNewBtn = document.getElementById('add-new');

// Load the initial data and render the list
loadData().then(() => {
  renderList();
});

// Event listeners
addNewBtn.addEventListener('click', () => {
  addNewItem();
});
