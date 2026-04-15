import { adToBsString } from '@munatech/nepali-datepicker';

export function formatMoney(value: number | string | null | undefined) {
    const amount = Number(value ?? 0);

    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function formatQuantity(value: number | string | null | undefined, decimals = 3) {
    const amount = Number(value ?? 0);

    return amount.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatDisplayDate(value: string | null | undefined, useBsDates: boolean) {
    if (!value) {
        return '-';
    }

    if (!useBsDates) {
        return value;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return value;
    }

    return adToBsString(year, month, day, 'YYYY-MM-DD', 'en');
}

export function coerceNumber(value: string | number | null | undefined, fallback = 0) {
    const normalized = Number(value);

    return Number.isFinite(normalized) ? normalized : fallback;
}
