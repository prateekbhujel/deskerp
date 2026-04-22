import { adToBs, bsToAdString, getDaysInBsMonth, getMonthNames, getTodayBs, type NepaliDate } from '@munatech/nepali-datepicker';
import { InputNumber, Select, Space } from 'antd';

interface BsDateInputProps {
    value?: string | null;
    onChange: (value: string) => void;
    displayBsDates: boolean;
    disabled?: boolean;
}

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toIsoDate(year: number, month: number, day: number): string {
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toAdParts(value?: string | null): { year: number; month: number; day: number } {
    if (!value) {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        };
    }

    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        };
    }

    return { year, month, day };
}

function toBsDate(value?: string | null): NepaliDate {
    const ad = toAdParts(value);
    return adToBs(ad.year, ad.month, ad.day);
}

function daysInAdMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

export function BsDateInput({ value, onChange, displayBsDates, disabled }: BsDateInputProps) {
    if (displayBsDates) {
        const current = toBsDate(value) ?? getTodayBs();
        const months = getMonthNames('en');
        const days = Array.from({ length: getDaysInBsMonth(current.year, current.month) }, (_, index) => index + 1);
        const years = Array.from({ length: 120 }, (_, index) => 1970 + index);

        const updateDate = (next: Partial<NepaliDate>) => {
            const year = next.year ?? current.year;
            const month = next.month ?? current.month;
            const day = Math.min(next.day ?? current.day, getDaysInBsMonth(year, month));
            onChange(bsToAdString(year, month, day, 'YYYY-MM-DD'));
        };

        return (
            <Space.Compact block>
                <InputNumber
                    controls={false}
                    disabled={disabled}
                    value={current.year}
                    min={1970}
                    max={2150}
                    onChange={(nextYear) => {
                        if (nextYear) {
                            updateDate({ year: Number(nextYear) });
                        }
                    }}
                    style={{ width: '34%' }}
                />
                <Select
                    disabled={disabled}
                    value={current.month}
                    onChange={(nextMonth) => updateDate({ month: nextMonth })}
                    options={months.map((month, index) => ({
                        value: index + 1,
                        label: month,
                    }))}
                    style={{ width: '40%' }}
                />
                <InputNumber
                    controls={false}
                    disabled={disabled}
                    value={current.day}
                    min={1}
                    max={days.length}
                    onChange={(nextDay) => {
                        if (nextDay) {
                            updateDate({ day: Number(nextDay) });
                        }
                    }}
                    style={{ width: '26%' }}
                />
            </Space.Compact>
        );
    }

    const current = toAdParts(value);
    const days = Array.from({ length: daysInAdMonth(current.year, current.month) }, (_, index) => index + 1);

    const updateAdDate = (next: Partial<{ year: number; month: number; day: number }>) => {
        const year = next.year ?? current.year;
        const month = next.month ?? current.month;
        const day = Math.min(next.day ?? current.day, daysInAdMonth(year, month));
        onChange(toIsoDate(year, month, day));
    };

    return (
        <Space.Compact block>
            <InputNumber
                controls={false}
                disabled={disabled}
                value={current.year}
                min={1970}
                max={2150}
                onChange={(nextYear) => {
                    if (nextYear) {
                        updateAdDate({ year: Number(nextYear) });
                    }
                }}
                style={{ width: '34%' }}
            />
            <Select
                disabled={disabled}
                value={current.month}
                onChange={(nextMonth) => updateAdDate({ month: nextMonth })}
                options={EN_MONTHS.map((month, index) => ({
                    value: index + 1,
                    label: month,
                }))}
                style={{ width: '40%' }}
            />
            <InputNumber
                controls={false}
                disabled={disabled}
                value={current.day}
                min={1}
                max={days.length}
                onChange={(nextDay) => {
                    if (nextDay) {
                        updateAdDate({ day: Number(nextDay) });
                    }
                }}
                style={{ width: '26%' }}
            />
        </Space.Compact>
    );
}
