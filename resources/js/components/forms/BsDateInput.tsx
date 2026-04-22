import { adToBs, bsToAdString, getDaysInBsMonth, getMonthNames, getTodayBs, type NepaliDate } from '@munatech/nepali-datepicker';
import { DatePicker, Select, Space } from 'antd';
import dayjs from 'dayjs';

interface BsDateInputProps {
    value?: string | null;
    onChange: (value: string) => void;
    displayBsDates: boolean;
    placeholder?: string;
    disabled?: boolean;
}

function toBsDate(value?: string | null): NepaliDate | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return adToBs(year, month, day);
}

export function BsDateInput({ value, onChange, displayBsDates, placeholder, disabled }: BsDateInputProps) {
    if (displayBsDates) {
        const current = toBsDate(value) ?? getTodayBs();
        const months = getMonthNames('en');
        const days = Array.from({ length: getDaysInBsMonth(current.year, current.month) }, (_, index) => index + 1);
        const years = Array.from({ length: 101 }, (_, index) => 2000 + index);

        const updateDate = (next: Partial<NepaliDate>) => {
            const year = next.year ?? current.year;
            const month = next.month ?? current.month;
            const day = Math.min(next.day ?? current.day, getDaysInBsMonth(year, month));

            onChange(bsToAdString(year, month, day, 'YYYY-MM-DD'));
        };

        return (
            <Space.Compact block>
                <Select
                    value={current.year}
                    disabled={disabled}
                    onChange={(nextYear) => updateDate({ year: nextYear })}
                    options={years.map((year) => ({
                        value: year,
                        label: String(year),
                    }))}
                    style={{ width: '32%' }}
                    placeholder={placeholder}
                />
                <Select
                    value={current.month}
                    disabled={disabled}
                    onChange={(nextMonth) => updateDate({ month: nextMonth })}
                    options={months.map((month, index) => ({
                        value: index + 1,
                        label: month,
                    }))}
                    style={{ width: '42%' }}
                />
                <Select
                    value={current.day}
                    disabled={disabled}
                    onChange={(nextDay) => updateDate({ day: nextDay })}
                    options={days.map((day) => ({
                        value: day,
                        label: String(day),
                    }))}
                    style={{ width: '26%' }}
                />
            </Space.Compact>
        );
    }

    return (
        <DatePicker
            value={value ? dayjs(value) : null}
            onChange={(next) => onChange(next ? next.format('YYYY-MM-DD') : '')}
            disabled={disabled}
            className="w-full"
            placeholder={placeholder}
        />
    );
}
