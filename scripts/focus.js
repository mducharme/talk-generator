// focus.js
let focusedItem = null;

export function captureFocus(itemList) {
  const activeElement = document.activeElement;
  const parentDiv = activeElement.closest('.item');
  if (parentDiv) {
    const index = Array.from(itemList.children).indexOf(parentDiv);
    const field = activeElement.className; // Get the field type (e.g., text-editable, id-input)

    // If focused element is a contenteditable div, capture the caret position
    if (activeElement.isContentEditable) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const caretPosition = range.startOffset; // Store the caret position
      focusedItem = { index, field, caretPosition };
    } else {
      focusedItem = { index, field }; // For non-contenteditable elements
    }
  } else {
    focusedItem = null;
  }
}

export function restoreFocus(itemList) {
  if (focusedItem) {
    const { index, field, caretPosition } = focusedItem;
    const itemDiv = itemList.children[index];
    if (itemDiv) {
      const elementToFocus = itemDiv.querySelector(`.${field}`);
      if (elementToFocus) {
        elementToFocus.focus();

        // If restoring focus to a contenteditable element, set the caret position
        if (elementToFocus.isContentEditable && caretPosition !== undefined) {
          const range = document.createRange();
          const selection = window.getSelection();
          range.setStart(elementToFocus.childNodes[0], caretPosition);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        focusedItem = null; // Clear after restoring focus
      }
    }
  }
}
