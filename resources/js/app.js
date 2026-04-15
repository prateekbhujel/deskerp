import './bootstrap';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

const editableSelector = 'input, textarea, select, [contenteditable="true"]';

window.addEventListener('keydown', (event) => {
    if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
    }

    const activeElement = document.activeElement;

    if (activeElement?.matches(editableSelector)) {
        return;
    }

    const signature = `alt+${event.key.toLowerCase()}`;
    const target = document.querySelector(`[data-hotkey="${signature}"]`);

    if (!target) {
        return;
    }

    event.preventDefault();
    target.click();
});
