import { renderList, addNewItem } from './render.js';
import { loadData } from './data.js';

// Load the initial data and render the list
loadData().then(() => {
  renderList();
});


