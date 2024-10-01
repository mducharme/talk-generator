// Function to convert <break> tags back to [duration] for displaying in the UI
export function convertTagsToBreaks(text) {
  return text.replace(/<break time="([0-9.]+s)" \/>/g, '[$1]');
}

export function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function generateIdentifier(currentId) {
  const [part0, part1, part2] = currentId.split("-").map(Number);

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

  return `${newPart0.toString()}-${newPart1.toString().padStart(2, "0")}-${newPart2.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`; // Pad seconds with leading zero if necessary
}