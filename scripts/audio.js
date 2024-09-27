export function checkAudioExists(itemId) {
  return fetch(`audio/${itemId}.mp3`, {
    method: 'HEAD',
  })
    .then(response => response.ok) // If response is ok, the file exists
    .catch(() => false); // If there's an error, the file does not exist
}

export function generateAudio(itemId) {
  fetch(`generate.php?id=${itemId}`, {
    method: 'POST',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      return response.json();
    })
    .then(data => {
      alert('Audio generated successfully!');
    })
    .catch(error => {
      console.error('Error generating audio:', error);
      alert('Error generating audio');
    });
}