import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { paths } from '@/lib/paths';
import { SimpleOption } from '@/types/shared';
import { useForm } from '@inertiajs/react';
import { Button, Card, Checkbox, Input, InputNumber, Select, Space, Table, Typography } from 'antd';

interface ItemFormProps {
    mode: 'create' | 'edit';
    item: {
        id: number | null;
        sku: string;
        name: string;
        item_type: 'stockable' | 'service';
        unit_id: number | null;
        category_id: number | null;
        description: string;
        base_price: string;
        selling_price: string;
        tax_rate: string;
        allow_discount: boolean;
        track_inventory: boolean;
        opening_stock: string;
        reorder_level: string;
        is_active: boolean;
        price_tiers: Array<{
            label: string;
            amount: string;
        }>;
    };
    units: SimpleOption[];
    categories: SimpleOption[];
}

export default function ItemsForm({ mode, item, units, categories }: ItemFormProps) {
    const { data, setData, post, put, processing, errors, transform } = useForm({
        ...item,
        price_tiers: item.price_tiers.length ? item.price_tiers : [{ label: '', amount: '' }],
    });

    const submit = () => {
        transform((current) => ({
            ...current,
            price_tiers: current.price_tiers.filter((tier) => tier.label.trim() || tier.amount),
        }));

        if (mode === 'create') {
            post(paths.items.store, {
                preserveScroll: true,
            });
            return;
        }

        put(paths.items.edit(item.id as number).replace('/edit', ''), {
            preserveScroll: true,
        });
    };

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: true,
            handler: () => submit(),
        },
    ]);

    return (
        <AppShell
            title={mode === 'create' ? 'New Item' : `Edit ${item.name}`}
            subtitle="Maintain price tiers, tax defaults, and opening stock from the React workspace."
            activeKey="items"
            extra={
                <Button type="primary" loading={processing} onClick={submit}>
                    Save Item
                </Button>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card>
                    <div className="grid gap-4 xl:grid-cols-3">
                        <div>
                            <Typography.Text strong>SKU</Typography.Text>
                            <Input style={{ marginTop: 8 }} value={data.sku} onChange={(event) => setData('sku', event.target.value)} />
                        </div>
                        <div>
                            <Typography.Text strong>Name</Typography.Text>
                            <Input style={{ marginTop: 8 }} value={data.name} onChange={(event) => setData('name', event.target.value)} />
                        </div>
                        <div>
                            <Typography.Text strong>Item Type</Typography.Text>
                            <Select
                                className="w-full"
                                style={{ marginTop: 8 }}
                                value={data.item_type}
                                onChange={(value) => setData('item_type', value)}
                                options={[
                                    { value: 'stockable', label: 'Stockable' },
                                    { value: 'service', label: 'Service' },
                                ]}
                            />
                        </div>
                        <div>
                            <Typography.Text strong>Unit</Typography.Text>
                            <Select
                                className="w-full"
                                style={{ marginTop: 8 }}
                                value={data.unit_id ?? undefined}
                                onChange={(value) => setData('unit_id', value)}
                                options={units.map((unit) => ({ value: unit.id, label: unit.name }))}
                            />
                        </div>
                        <div>
                            <Typography.Text strong>Category</Typography.Text>
                            <Select
                                allowClear
                                className="w-full"
                                style={{ marginTop: 8 }}
                                value={data.category_id ?? undefined}
                                onChange={(value) => setData('category_id', value ?? null)}
                                options={categories.map((category) => ({ value: category.id, label: category.name }))}
                            />
                        </div>
                        <div>
                            <Typography.Text strong>Tax Rate %</Typography.Text>
                            <InputNumber className="w-full" style={{ marginTop: 8 }} value={Number(data.tax_rate)} min={0} step={0.01} onChange={(value) => setData('tax_rate', String(value ?? ''))} />
                        </div>
                        <div>
                            <Typography.Text strong>Base Price</Typography.Text>
                            <InputNumber className="w-full" style={{ marginTop: 8 }} value={Number(data.base_price)} min={0} step={0.01} onChange={(value) => setData('base_price', String(value ?? ''))} />
                        </div>
                        <div>
                            <Typography.Text strong>Selling Price</Typography.Text>
                            <InputNumber className="w-full" style={{ marginTop: 8 }} value={Number(data.selling_price)} min={0} step={0.01} onChange={(value) => setData('selling_price', String(value ?? ''))} />
                        </div>
                        <div>
                            <Typography.Text strong>Opening Stock</Typography.Text>
                            <InputNumber className="w-full" style={{ marginTop: 8 }} value={Number(data.opening_stock)} min={0} step={0.001} onChange={(value) => setData('opening_stock', String(value ?? ''))} />
                        </div>
                        <div>
                            <Typography.Text strong>Reorder Level</Typography.Text>
                            <InputNumber className="w-full" style={{ marginTop: 8 }} value={Number(data.reorder_level)} min={0} step={0.001} onChange={(value) => setData('reorder_level', String(value ?? ''))} />
                        </div>
                        <div className="xl:col-span-3">
                            <Typography.Text strong>Description</Typography.Text>
                            <Input.TextArea style={{ marginTop: 8 }} rows={4} value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        </div>
                    </div>

                    <Space wrap style={{ marginTop: 16 }}>
                        <Checkbox checked={data.allow_discount} onChange={(event) => setData('allow_discount', event.target.checked)}>
                            Allow Discount
                        </Checkbox>
                        <Checkbox checked={data.track_inventory} onChange={(event) => setData('track_inventory', event.target.checked)}>
                            Track Inventory
                        </Checkbox>
                        <Checkbox checked={data.is_active} onChange={(event) => setData('is_active', event.target.checked)}>
                            Active
                        </Checkbox>
                    </Space>

                    {Object.values(errors).length ? (
                        <div style={{ marginTop: 16 }}>
                            {Object.entries(errors).map(([field, message]) => (
                                <Typography.Text key={field} type="danger" style={{ display: 'block' }}>
                                    {message}
                                </Typography.Text>
                            ))}
                        </div>
                    ) : null}
                </Card>

                <Card
                    title="Price Tiers"
                    extra={
                        <Button onClick={() => setData('price_tiers', [...data.price_tiers, { label: '', amount: '' }])}>
                            Add Tier
                        </Button>
                    }
                >
                    <Table
                        rowKey={(_, index) => index ?? 0}
                        pagination={false}
                        dataSource={data.price_tiers}
                        columns={[
                            {
                                title: 'Label',
                                render: (_, tier, index) => (
                                    <Input
                                        value={tier.label}
                                        onChange={(event) => {
                                            const next = [...data.price_tiers];
                                            next[index] = { ...tier, label: event.target.value };
                                            setData('price_tiers', next);
                                        }}
                                    />
                                ),
                            },
                            {
                                title: 'Amount',
                                render: (_, tier, index) => (
                                    <InputNumber
                                        className="w-full"
                                        value={Number(tier.amount || 0)}
                                        min={0}
                                        step={0.01}
                                        onChange={(value) => {
                                            const next = [...data.price_tiers];
                                            next[index] = { ...tier, amount: String(value ?? '') };
                                            setData('price_tiers', next);
                                        }}
                                    />
                                ),
                            },
                            {
                                title: '',
                                width: 80,
                                render: (_, __, index) => (
                                    <Button
                                        type="text"
                                        danger
                                        onClick={() => {
                                            const next = data.price_tiers.filter((_, tierIndex) => tierIndex !== index);
                                            setData('price_tiers', next.length ? next : [{ label: '', amount: '' }]);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                ),
                            },
                        ]}
                    />
                </Card>
            </Space>
        </AppShell>
    );
}
