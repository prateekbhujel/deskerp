import { AppShell } from '@/components/layout/AppShell';
import { coerceNumber, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SimpleOption } from '@/types/shared';
import { Link, router } from '@inertiajs/react';
import { Button, Card, Input, Select, Space, Table, Tag, Typography } from 'antd';
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
        <AppShell
            title="Items and Pricing Register"
            subtitle="Stock and service masters with selling rate, opening stock, and active price controls."
            activeKey="items"
            extra={
                <Space wrap>
                    <Link href={paths.reports.inventory}>
                        <Button>Inventory Report</Button>
                    </Link>
                    <Link href={paths.items.create}>
                        <Button type="primary">New Item Master</Button>
                    </Link>
                </Space>
            }
        >
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <div className="grid gap-3 lg:grid-cols-4">
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Visible Items</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {summary.visibleRecords}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Active</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {summary.activeCount}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Stockable</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {summary.stockTracked}
                        </Typography.Title>
                    </Card>
                    <Card className="dp-dense-stat">
                        <Typography.Text type="secondary">Page Stock Qty</Typography.Text>
                        <Typography.Title level={4} style={{ margin: '6px 0 0' }}>
                            {formatQuantity(summary.pageStock)}
                        </Typography.Title>
                    </Card>
                </div>

                <Card className="dp-dense-card">
                    <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_auto]">
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
                        <Space>
                            <Button type="primary" onClick={() => applyFilters()}>
                                Apply
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
                    </div>
                </Card>

                <Card className="dp-dense-card">
                    <Table
                        rowKey="id"
                        size="small"
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
                                render: (_, record) => (
                                    <Space direction="vertical" size={0}>
                                        <Link href={paths.items.show(record.id)}>{record.name}</Link>
                                        <Typography.Text type="secondary">{record.sku || 'No SKU'}</Typography.Text>
                                    </Space>
                                ),
                            },
                            {
                                title: 'Type',
                                width: 110,
                                dataIndex: 'item_type',
                            },
                            {
                                title: 'Unit',
                                width: 110,
                                dataIndex: 'unit_name',
                                render: (value) => value || '-',
                            },
                            {
                                title: 'Category',
                                render: (_, record) => <Typography.Text type="secondary">{record.category_name || '-'}</Typography.Text>,
                            },
                            {
                                title: 'Selling',
                                width: 120,
                                align: 'right',
                                render: (_, record) => formatMoney(record.selling_price),
                            },
                            {
                                title: 'Stock',
                                width: 120,
                                align: 'right',
                                render: (_, record) => formatQuantity(record.current_stock),
                            },
                            {
                                title: 'Status',
                                width: 110,
                                render: (_, record) => <Tag color={record.is_active ? 'green' : 'default'}>{record.is_active ? 'Active' : 'Inactive'}</Tag>,
                            },
                            {
                                title: 'Action',
                                width: 80,
                                render: (_, record) => <Link href={paths.items.edit(record.id)}>Edit</Link>,
                            },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
