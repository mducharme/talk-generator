// data.js

export let data = [];

// Function to load data from the API
export function loadData() {
  return fetch('php/content.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      return response.json();
    })
    .then(jsonData => {
      data = jsonData;
      return data;
    })
    .catch(error => {
      console.error('Error loading data:', error.message);
    });
}

// Function to auto-save the JSON after any change
export function saveData(updatedData) {
  const jsonData = JSON.stringify(updatedData);

  return fetch('php/save.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: jsonData,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to save data.');
    }
  })
  .catch(error => {
    console.error('Error saving data:', error.message);
  });
}