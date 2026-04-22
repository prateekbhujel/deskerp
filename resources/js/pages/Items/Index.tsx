import { AppShell } from '@/components/layout/AppShell';
import { coerceNumber, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SimpleOption } from '@/types/shared';
import { Link, router } from '@inertiajs/react';
import { Button, Input, Select, Table } from 'antd';
import { useMemo, useState } from 'react';

interface ItemsIndexProps {
    items: PaginatedResponse<{
        id: number;
        sku?: string | null;
        name: string;
        item_type: string;
        unit_name?: string | null;
        category_name?: string | null;
        selling_price: string;
        current_stock: string;
        is_active: boolean;
    }>;
    filters: {
        q: string;
        category_id: string;
        status: string;
    };
    categories: SimpleOption[];
}

export default function ItemsIndex({ items, filters, categories }: ItemsIndexProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const summary = useMemo(
        () => ({
            visibleRecords: items.data.length,
            activeCount: items.data.filter((item) => item.is_active).length,
            stockTracked: items.data.filter((item) => item.item_type === 'stockable').length,
            pageStock: items.data.reduce((carry, item) => carry + coerceNumber(item.current_stock), 0),
        }),
        [items.data],
    );

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.items.index,
            {
                ...localFilters,
                page: nextPage,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppShell title="Items & Pricing" subtitle="Item Master Register" activeKey="items">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Summary</h3>
                    </div>
                    <ul className="dp-section-list">
                        <li>
                            <span>Visible Items</span>
                            <span>{summary.visibleRecords}</span>
                        </li>
                        <li>
                            <span>Active</span>
                            <span>{summary.activeCount}</span>
                        </li>
                        <li>
                            <span>Stockable</span>
                            <span>{summary.stockTracked}</span>
                        </li>
                        <li>
                            <span>Page Stock Qty</span>
                            <span>{formatQuantity(summary.pageStock)}</span>
                        </li>
                    </ul>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Filters</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-4">
                            <label className="dp-field-label">Search</label>
                            <Input value={localFilters.q} onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))} onPressEnter={() => applyFilters()} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Category</label>
                            <Select
                                allowClear
                                value={localFilters.category_id || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, category_id: value ?? '' }))}
                                options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Status</label>
                            <Select
                                allowClear
                                value={localFilters.status || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, status: value ?? '' }))}
                                options={[
                                    { value: 'active', label: 'ACTIVE' },
                                    { value: 'inactive', label: 'INACTIVE' },
                                ]}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Button type="primary" onClick={() => applyFilters()}>
                                    Show
                                </Button>{' '}
                                <Link href={paths.items.create}>
                                    <Button type="primary">New Item</Button>
                                </Link>{' '}
                                <Link href={paths.reports.inventory}>
                                    <Button>Inventory Report</Button>
                                </Link>{' '}
                                <Button
                                    onClick={() => {
                                        const cleared = { q: '', category_id: '', status: '' };
                                        setLocalFilters(cleared);
                                        router.get(paths.items.index, {}, { replace: true });
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Rows</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={items.data}
                        locale={{ emptyText: 'No items found. Add item to start pricing and inventory.' }}
                        pagination={{
                            current: items.meta.currentPage,
                            total: items.meta.total,
                            pageSize: items.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Item',
                                render: (_, record) => (
                                    <div>
                                        <div>
                                            <Link href={paths.items.show(record.id)}>{record.name}</Link>
                                        </div>
                                        <div style={{ color: '#6b7280' }}>{record.sku || '-'}</div>
                                    </div>
                                ),
                            },
                            { title: 'Type', width: 110, dataIndex: 'item_type' },
                            { title: 'Unit', width: 110, dataIndex: 'unit_name', render: (value) => value || '-' },
                            { title: 'Category', render: (_, record) => record.category_name || '-' },
                            { title: 'Selling', width: 120, align: 'right', render: (_, record) => formatMoney(record.selling_price) },
                            { title: 'Stock', width: 120, align: 'right', render: (_, record) => formatQuantity(record.current_stock) },
                            { title: 'Status', width: 110, render: (_, record) => (record.is_active ? 'ACTIVE' : 'INACTIVE') },
                            { title: 'Action', width: 80, render: (_, record) => <Link href={paths.items.edit(record.id)}>Edit</Link> },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
