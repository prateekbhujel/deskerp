import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney, formatQuantity } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SharedProps } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { Button, Table } from 'antd';

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
        <AppShell title={item.name} subtitle="Item Master Detail" activeKey="items">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Header</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">SKU</label>
                            <div>{item.sku || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Type</label>
                            <div>{item.item_type}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Status</label>
                            <div>{item.is_active ? 'ACTIVE' : 'INACTIVE'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Unit</label>
                            <div>{item.unit_name || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Category</label>
                            <div>{item.category_name || '-'}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Tax Rate</label>
                            <div>{Number(item.tax_rate).toFixed(2)}%</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Base Price</label>
                            <div>{formatMoney(item.base_price)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Selling Price</label>
                            <div>{formatMoney(item.selling_price)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Current Stock</label>
                            <div data-testid="item-current-stock">{formatQuantity(item.current_stock)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Opening Stock</label>
                            <div>{formatQuantity(item.opening_stock)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Reorder Level</label>
                            <div>{formatQuantity(item.reorder_level)}</div>
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Action</label>
                            <div>
                                <Link href={paths.items.edit(item.id)}>
                                    <Button>Edit Item</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="dp-field col-span-12">
                            <label className="dp-field-label">Description</label>
                            <div>{item.description || '-'}</div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Price Tiers</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={item.price_tiers}
                        locale={{ emptyText: 'No price tiers configured.' }}
                        columns={[
                            { title: 'Label', dataIndex: 'label' },
                            { title: 'Amount', align: 'right', render: (_, record) => formatMoney(record.amount) },
                        ]}
                    />
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Stock Movements</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={item.stock_movements}
                        locale={{ emptyText: 'No stock movement entries.' }}
                        columns={[
                            { title: 'Date', render: (_, record) => formatDisplayDate(record.movement_date, useBsDates) },
                            { title: 'Type', dataIndex: 'movement_type' },
                            { title: 'Reference', dataIndex: 'reference_number', render: (value) => value || '-' },
                            { title: 'Notes', dataIndex: 'notes', render: (value) => value || '-' },
                            { title: 'Qty Change', align: 'right', render: (_, record) => formatQuantity(record.quantity_change) },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
