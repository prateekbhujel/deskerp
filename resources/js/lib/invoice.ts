import { coerceNumber } from '@/lib/format';

export interface InvoiceLineDraft {
    item_id?: number | null;
    description: string;
    unit_name: string;
    quantity: number | string;
    rate: number | string;
    discount_percent: number | string;
    tax_percent: number | string;
}

export function calculateInvoiceLinePreview(line: InvoiceLineDraft) {
    const quantity = coerceNumber(line.quantity);
    const rate = coerceNumber(line.rate);
    const discountPercent = coerceNumber(line.discount_percent);
    const taxPercent = coerceNumber(line.tax_percent);
    const subtotal = quantity * rate;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableSubtotal = subtotal - discountAmount;
    const taxTotal = (taxableSubtotal * taxPercent) / 100;
    const total = taxableSubtotal + taxTotal;

    return {
        subtotal,
        discountAmount,
        taxTotal,
        total,
    };
}

export function calculateInvoicePreview(lines: InvoiceLineDraft[]) {
    const normalized = lines.filter((line) => line.description.trim() || line.item_id);

    const totals = normalized.map((line) => calculateInvoiceLinePreview(line));

    return totals.reduce(
        (carry, line) => ({
            subtotal: carry.subtotal + line.subtotal,
            discountTotal: carry.discountTotal + line.discountAmount,
            taxTotal: carry.taxTotal + line.taxTotal,
            total: carry.total + line.total,
        }),
        {
            subtotal: 0,
            discountTotal: 0,
            taxTotal: 0,
            total: 0,
        },
    );
}
