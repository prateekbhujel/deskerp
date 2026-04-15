import { useEffect } from 'react';

interface Shortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    allowInInputs?: boolean;
    handler: (event: KeyboardEvent) => void;
}

function isEditableTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
                    continue;
                }

                if (Boolean(shortcut.ctrl) !== event.ctrlKey) {
                    continue;
                }

                if (Boolean(shortcut.alt) !== event.altKey) {
                    continue;
                }

                if (Boolean(shortcut.shift) !== event.shiftKey) {
                    continue;
                }

                if (Boolean(shortcut.meta) !== event.metaKey) {
                    continue;
                }

                if (!shortcut.allowInInputs && isEditableTarget(event.target)) {
                    continue;
                }

                event.preventDefault();
                shortcut.handler(event);
                return;
            }
        };

        window.addEventListener('keydown', listener);

        return () => window.removeEventListener('keydown', listener);
    }, [shortcuts]);
}
