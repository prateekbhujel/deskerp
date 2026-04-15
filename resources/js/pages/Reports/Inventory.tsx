import { AppShell } from '@/components/layout/AppShell';
import { formatMoney, formatQuantity } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { PaginatedResponse, SimpleOption } from '@/types/shared';
import { router } from '@inertiajs/react';
import { Button, Card, Input, Select, Space, Statistic, Table } from 'antd';
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
        <AppShell title="Inventory Report" subtitle="Current stock snapshot with CSV/XLSX export." activeKey="reports">
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Space wrap size="large">
                    <Statistic title="Tracked Items" value={summary.tracked_items} />
                    <Statistic title="Low Stock Items" value={summary.low_stock_items} />
                </Space>

                <Card
                    extra={
                        <Space wrap>
                            <a href={withQuery(paths.reports.inventory, { ...localFilters, export: 'csv' })}>
                                <Button>CSV</Button>
                            </a>
                            <a href={withQuery(paths.reports.inventory, { ...localFilters, export: 'xlsx' })}>
                                <Button type="primary">XLSX</Button>
                            </a>
                        </Space>
                    }
                >
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Input value={localFilters.q} onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Search item or SKU" />
                        <Select
                            allowClear
                            placeholder="Category"
                            value={localFilters.category_id || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, category_id: value ?? '' }))}
                            options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
                        />
                        <Button type="primary" onClick={() => applyFilters()}>
                            Apply Filters
                        </Button>
                    </div>
                </Card>

                <Card>
                    <Table
                        rowKey="id"
                        dataSource={items.data}
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
                            { title: 'Current Stock', align: 'right', render: (_, record) => formatQuantity(record.current_stock) },
                            { title: 'Reorder', align: 'right', render: (_, record) => formatQuantity(record.reorder_level) },
                            { title: 'Base Price', align: 'right', render: (_, record) => formatMoney(record.base_price) },
                            {
                                title: 'Stock Value',
                                align: 'right',
                                render: (_, record) => formatMoney(Number(record.current_stock) * Number(record.base_price)),
                            },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
