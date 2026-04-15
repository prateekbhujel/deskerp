import { LookupOption, LookupResponse } from '@/types/shared';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { Select, Spin } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { useEffect, useMemo, useState } from 'react';

interface RemoteLookupSelectProps<T extends Record<string, unknown>> {
    endpoint: string;
    value?: LookupOption<T> | null;
    onChange: (value: LookupOption<T> | null) => void;
    mapOption: (record: T) => LookupOption<T>;
    placeholder?: string;
    allowClear?: boolean;
    disabled?: boolean;
    testId?: string;
}

function mergeOptions<T extends Record<string, unknown>>(existing: LookupOption<T>[], incoming: LookupOption<T>[]) {
    const map = new Map<number, LookupOption<T>>();

    [...existing, ...incoming].forEach((option) => {
        map.set(option.value, option);
    });

    return [...map.values()];
}

export const RemoteLookupSelect = <T extends Record<string, unknown>,>({
    endpoint,
    value,
    onChange,
    mapOption,
    placeholder,
    allowClear = true,
    disabled = false,
    testId,
}: RemoteLookupSelectProps<T>) => {
    const [options, setOptions] = useState<LookupOption<T>[]>(value ? [value] : []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [nextPage, setNextPage] = useState<number | null>(1);

    const loadOptions = useMemo(
        () =>
            debounce(async (term: string, page: number, append: boolean) => {
                setLoading(true);

                try {
                    const response = await axios.get<LookupResponse<T>>(endpoint, {
                        params: {
                            q: term || undefined,
                            page,
                            per_page: 15,
                        },
                    });

                    const mapped = response.data.data.map(mapOption);

                    setOptions((current) => (append ? mergeOptions(current, mapped) : mergeOptions(value ? [value] : [], mapped)));
                    setNextPage(response.data.meta.hasMorePages ? response.data.meta.nextPage : null);
                } finally {
                    setLoading(false);
                }
            }, 250),
        [endpoint, mapOption, value],
    );

    useEffect(() => {
        return () => loadOptions.cancel();
    }, [loadOptions]);

    useEffect(() => {
        if (value) {
            setOptions((current) => mergeOptions(current, [value]));
        }
    }, [value]);

    return (
        <Select
            data-testid={testId}
            showSearch
            allowClear={allowClear}
            filterOption={false}
            disabled={disabled}
            placeholder={placeholder}
            value={value?.value}
            options={options as DefaultOptionType[]}
            notFoundContent={loading ? <Spin size="small" /> : null}
            onFocus={() => {
                if (!options.length) {
                    loadOptions('', 1, false);
                }
            }}
            onSearch={(term) => {
                setSearch(term);
                setNextPage(1);
                loadOptions(term, 1, false);
            }}
            onPopupScroll={(event) => {
                const target = event.target as HTMLDivElement;

                if (!nextPage || loading) {
                    return;
                }

                if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 24) {
                    loadOptions(search, nextPage, true);
                }
            }}
            onChange={(_, option) => {
                if (!option) {
                    onChange(null);
                    return;
                }

                onChange(option as LookupOption<T>);
            }}
        />
    );
};
