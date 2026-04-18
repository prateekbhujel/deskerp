import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Card, Descriptions, Space, Table, Tag } from 'antd';

interface ItemsShowProps {
    item: {
        id: number;
        sku?: string | null;
        name: string;
        item_type: string;
        description?: string | null;
        unit_name?: string | null;
        category_name?: string | null;
        base_price: string;
        selling_price: string;
        tax_rate: string;
        allow_discount: boolean;
        track_inventory: boolean;
        current_stock: string;
        opening_stock: string;
        reorder_level: string;
        is_active: boolean;
        price_tiers: Array<{
            id: number;
            label: string;
            amount: string;
        }>;
        stock_movements: Array<{
            id: number;
            movement_date: string;
            movement_type: string;
            quantity_change: string;
            reference_number?: string | null;
            notes?: string | null;
        }>;
    };
}

export default function ItemsShow({ item }: ItemsShowProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;

    return (
        <AppShell
            title={item.name}
            subtitle="Item profile, pricing tiers, and stock movement history."
            activeKey="items"
            extra={
                <Link href={paths.items.edit(item.id)}>
                    <Button>Edit Item</Button>
                </Link>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card className="dp-dense-card">
                    <Descriptions column={{ xs: 1, md: 2, xl: 3 }} bordered>
                        <Descriptions.Item label="SKU">{item.sku || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Type">{item.item_type}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={item.is_active ? 'green' : 'default'}>{item.is_active ? 'Active' : 'Inactive'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Unit">{item.unit_name || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Category">{item.category_name || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Tax Rate">{Number(item.tax_rate).toFixed(2)}%</Descriptions.Item>
                        <Descriptions.Item label="Base Price">{formatMoney(item.base_price)}</Descriptions.Item>
                        <Descriptions.Item label="Selling Price">{formatMoney(item.selling_price)}</Descriptions.Item>
                        <Descriptions.Item label="Current Stock">
                            <span data-testid="item-current-stock">{formatQuantity(item.current_stock)}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Opening Stock">{formatQuantity(item.opening_stock)}</Descriptions.Item>
                        <Descriptions.Item label="Reorder Level">{formatQuantity(item.reorder_level)}</Descriptions.Item>
                        <Descriptions.Item label="Allow Discount">{item.allow_discount ? 'Yes' : 'No'}</Descriptions.Item>
                        <Descriptions.Item label="Track Inventory">{item.track_inventory ? 'Yes' : 'No'}</Descriptions.Item>
                        <Descriptions.Item label="Description" span={3}>
                            {item.description || '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Price Tiers" className="dp-dense-card">
                    <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={item.price_tiers}
                        locale={{ emptyText: 'No price tiers configured for this item.' }}
                        columns={[
                            { title: 'Label', dataIndex: 'label' },
                            { title: 'Amount', align: 'right', render: (_, record) => formatMoney(record.amount) },
                        ]}
                    />
                </Card>

                <Card title="Stock Movements" className="dp-dense-card">
                    <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={item.stock_movements}
                        locale={{ emptyText: 'No stock movement entries yet.' }}
                        columns={[
                            {
                                title: 'Date',
                                render: (_, record) => formatDisplayDate(record.movement_date, useBsDates),
                            },
                            { title: 'Type', dataIndex: 'movement_type' },
                            { title: 'Reference', dataIndex: 'reference_number', render: (value) => value || '-' },
                            { title: 'Notes', dataIndex: 'notes', render: (value) => value || '-' },
                            { title: 'Qty Change', align: 'right', render: (_, record) => formatQuantity(record.quantity_change) },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
