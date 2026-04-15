import { AppShell } from '@/components/layout/AppShell';
import { formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SharedProps, SimpleOption } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Card, Input, Select, Space, Table, Tag } from 'antd';
import { useState } from 'react';

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
    usePage<SharedProps>();

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
        <AppShell
            title="Items"
            subtitle="Pricing tiers, opening stock, and inventory-tracked behavior all remain backed by the existing Laravel services."
            activeKey="items"
            extra={
                <Link href={paths.items.create}>
                    <Button type="primary">New Item</Button>
                </Link>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Input
                            data-global-search="true"
                            placeholder="Search item or SKU"
                            value={localFilters.q}
                            onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))}
                            onPressEnter={() => applyFilters()}
                        />
                        <Select
                            allowClear
                            placeholder="Category"
                            value={localFilters.category_id || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, category_id: value ?? '' }))}
                            options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
                        />
                        <Select
                            allowClear
                            placeholder="Status"
                            value={localFilters.status || undefined}
                            onChange={(value) => setLocalFilters((current) => ({ ...current, status: value ?? '' }))}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                        />
                    </div>
                    <Space style={{ marginTop: 16 }}>
                        <Button type="primary" onClick={() => applyFilters()}>
                            Apply Filters
                        </Button>
                        <Button
                            onClick={() => {
                                const cleared = { q: '', category_id: '', status: '' };
                                setLocalFilters(cleared);
                                router.get(paths.items.index, {}, { replace: true });
                            }}
                        >
                            Reset
                        </Button>
                    </Space>
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
                            {
                                title: 'Item',
                                render: (_, record) => <Link href={paths.items.show(record.id)}>{record.name}</Link>,
                            },
                            {
                                title: 'SKU',
                                dataIndex: 'sku',
                                render: (value) => value || '-',
                            },
                            {
                                title: 'Type',
                                dataIndex: 'item_type',
                            },
                            {
                                title: 'Unit',
                                dataIndex: 'unit_name',
                                render: (value) => value || '-',
                            },
                            {
                                title: 'Category',
                                dataIndex: 'category_name',
                                render: (value) => value || '-',
                            },
                            {
                                title: 'Selling Price',
                                align: 'right',
                                render: (_, record) => formatMoney(record.selling_price),
                            },
                            {
                                title: 'Stock',
                                align: 'right',
                                render: (_, record) => formatQuantity(record.current_stock),
                            },
                            {
                                title: 'Status',
                                render: (_, record) => <Tag color={record.is_active ? 'green' : 'default'}>{record.is_active ? 'Active' : 'Inactive'}</Tag>,
                            },
                            {
                                title: 'Actions',
                                render: (_, record) => <Link href={paths.items.edit(record.id)}>Edit</Link>,
                            },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
