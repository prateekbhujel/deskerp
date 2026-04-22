import { useEffect, useMemo, useState } from 'react';

export interface ShortcutLabels {
    save: string;
    newInvoice: string;
    newPayment: string;
    focusAmount: string;
    addLineRow: string;
    clearForm: string;
    notesField: string;
    toggleSidebar: string;
    searchInvoice: string;
    addCustomer: string;
    reports: string;
    goBack: string;
}

const WINDOWS_SHORTCUTS: ShortcutLabels = {
    save: 'Ctrl+S',
    newInvoice: 'Alt+N',
    newPayment: 'Alt+P',
    focusAmount: 'Alt+A',
    addLineRow: 'Alt+L',
    clearForm: 'Alt+X',
    notesField: 'Alt+O',
    toggleSidebar: 'Alt+\\',
    searchInvoice: 'Alt+I',
    addCustomer: 'Alt+C',
    reports: 'Alt+R',
    goBack: 'Escape',
};

const MAC_SHORTCUTS: ShortcutLabels = {
    save: '⌘S',
    newInvoice: '⌥N',
    newPayment: '⌥P',
    focusAmount: '⌥A',
    addLineRow: '⌥L',
    clearForm: '⌥X',
    notesField: '⌥O',
    toggleSidebar: '⌥\\',
    searchInvoice: '⌥I',
    addCustomer: '⌥C',
    reports: '⌥R',
    goBack: 'Escape',
};

function isMacPlatform() {
    if (typeof navigator === 'undefined') {
        return false;
    }

    return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
}

export function usePlatformShortcuts() {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(isMacPlatform());
    }, []);

    return useMemo(
        () => ({
            isMac,
            shortcuts: isMac ? MAC_SHORTCUTS : WINDOWS_SHORTCUTS,
        }),
        [isMac],
    );
}
