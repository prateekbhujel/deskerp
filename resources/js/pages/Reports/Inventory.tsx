import { AppShell } from '@/components/layout/AppShell';
import { formatMoney, formatQuantity } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { PaginatedResponse, SimpleOption } from '@/types/shared';
import { router } from '@inertiajs/react';
import { Button, Input, Select, Table } from 'antd';
import { useState } from 'react';

interface InventoryReportProps {
    items: PaginatedResponse<{
        id: number;
        sku?: string | null;
        name: string;
        category_name?: string | null;
        unit_name?: string | null;
        current_stock: string;
        reorder_level: string;
        base_price: string;
        stock_value: string;
    }>;
    summary: {
        tracked_items: number;
        low_stock_items: number;
    };
    categories: SimpleOption[];
    filters: {
        q: string;
        category_id: string;
    };
}

export default function InventoryReport({ items, summary, categories, filters }: InventoryReportProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.reports.inventory,
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
        <AppShell title="Stock Summary" subtitle="Inventory Register" activeKey="reports">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Summary</h3>
                    </div>
                    <div className="dp-summary-grid">
                        <span>Tracked Items</span>
                        <strong>{summary.tracked_items}</strong>
                        <span className="dp-summary-total">Low Stock</span>
                        <strong className="dp-summary-total">{summary.low_stock_items}</strong>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Filters</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Search</label>
                            <Input value={localFilters.q} onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Category</label>
                            <Select
                                allowClear
                                value={localFilters.category_id || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, category_id: value ?? '' }))}
                                options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-7">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Button type="primary" onClick={() => applyFilters()}>
                                    Show
                                </Button>{' '}
                                <Button onClick={() => window.print()}>Print</Button>{' '}
                                <a href={withQuery(paths.reports.inventory, { ...localFilters, export: 'csv' })}>
                                    <Button>Export CSV</Button>
                                </a>{' '}
                                <a href={withQuery(paths.reports.inventory, { ...localFilters, export: 'xlsx' })}>
                                    <Button>Export XLSX</Button>
                                </a>
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
                        locale={{ emptyText: 'No stock rows for current filters.' }}
                        pagination={{
                            current: items.meta.currentPage,
                            total: items.meta.total,
                            pageSize: items.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            { title: 'SKU', dataIndex: 'sku', render: (value) => value || '-' },
                            { title: 'Item', dataIndex: 'name' },
                            { title: 'Category', dataIndex: 'category_name', render: (value) => value || '-' },
                            { title: 'Unit', dataIndex: 'unit_name', render: (value) => value || '-' },
                            { title: 'Current', align: 'right', render: (_, record) => formatQuantity(record.current_stock) },
                            { title: 'Reorder', align: 'right', render: (_, record) => formatQuantity(record.reorder_level) },
                            { title: 'Base', align: 'right', render: (_, record) => formatMoney(record.base_price) },
                            { title: 'Value', align: 'right', render: (_, record) => formatMoney(record.stock_value) },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
