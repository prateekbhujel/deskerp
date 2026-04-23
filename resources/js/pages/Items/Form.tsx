import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { coerceNumber } from '@/lib/format';
import { paths } from '@/lib/paths';
import { SimpleOption } from '@/types/shared';
import { router, useForm } from '@inertiajs/react';
import { Button, Checkbox, Input, InputNumber, Select, Space, Table } from 'antd';
import { useMemo } from 'react';

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

    const summary = useMemo(
        () => ({
            grossMargin: coerceNumber(data.selling_price) - coerceNumber(data.base_price),
            tierCount: data.price_tiers.filter((tier) => tier.label.trim() || tier.amount).length,
        }),
        [data.base_price, data.price_tiers, data.selling_price],
    );

    const submit = () => {
        transform((current) => ({
            ...current,
            price_tiers: current.price_tiers.filter((tier) => tier.label.trim() || tier.amount),
        }));

        if (mode === 'create') {
            post(paths.items.store, { preserveScroll: true });
            return;
        }

        put(paths.items.edit(item.id as number).replace('/edit', ''), { preserveScroll: true });
    };

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: true,
            allowInInputs: true,
            handler: () => submit(),
        },
        {
            key: 't',
            alt: true,
            allowInInputs: true,
            handler: () => setData('price_tiers', [...data.price_tiers, { label: '', amount: '' }]),
        },
        {
            key: 'Escape',
            allowInInputs: true,
            handler: () => router.visit(paths.items.index),
        },
    ]);

    return (
        <AppShell title={mode === 'create' ? 'Item Master' : `Item Master ${item.name}`} subtitle="Pricing / Stock Setup" activeKey="items">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Item Details</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">SKU</label>
                            <Input value={data.sku} onChange={(event) => setData('sku', event.target.value)} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Item Name</label>
                            <Input value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {errors.name ? <span className="dp-error-text">{errors.name}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Item Type</label>
                            <Select
                                value={data.item_type}
                                onChange={(value) => setData('item_type', value)}
                                options={[
                                    { value: 'stockable', label: 'STOCKABLE' },
                                    { value: 'service', label: 'SERVICE' },
                                ]}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Unit</label>
                            <Select value={data.unit_id ?? undefined} onChange={(value) => setData('unit_id', value)} options={units.map((unit) => ({ value: unit.id, label: unit.name }))} />
                            {errors.unit_id ? <span className="dp-error-text">{errors.unit_id}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Category</label>
                            <Select
                                allowClear
                                value={data.category_id ?? undefined}
                                onChange={(value) => setData('category_id', value ?? null)}
                                options={categories.map((category) => ({ value: category.id, label: category.name }))}
                            />
                            {errors.category_id ? <span className="dp-error-text">{errors.category_id}</span> : null}
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Base Price</label>
                            <InputNumber controls={false} className="w-full" value={Number(data.base_price)} min={0} step={0.01} onChange={(value) => setData('base_price', String(value ?? '0'))} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Selling Price</label>
                            <InputNumber controls={false} className="w-full" value={Number(data.selling_price)} min={0} step={0.01} onChange={(value) => setData('selling_price', String(value ?? '0'))} />
                            {errors.selling_price ? <span className="dp-error-text">{errors.selling_price}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Tax %</label>
                            <InputNumber controls={false} className="w-full" value={Number(data.tax_rate)} min={0} step={0.01} onChange={(value) => setData('tax_rate', String(value ?? '0'))} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Opening Stock</label>
                            <InputNumber controls={false} className="w-full" value={Number(data.opening_stock)} min={0} step={0.001} onChange={(value) => setData('opening_stock', String(value ?? '0'))} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Reorder Level</label>
                            <InputNumber controls={false} className="w-full" value={Number(data.reorder_level)} min={0} step={0.001} onChange={(value) => setData('reorder_level', String(value ?? '0'))} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Margin</label>
                            <div>{summary.grossMargin.toFixed(2)}</div>
                        </div>
                        <div className="dp-field col-span-12">
                            <label className="dp-field-label">Description</label>
                            <Input.TextArea rows={2} value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Space size={12}>
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
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Price Tiers</h3>
                        <Button onClick={() => setData('price_tiers', [...data.price_tiers, { label: '', amount: '' }])}>Add Tier</Button>
                    </div>
                    <Table
                        rowKey={(_, index) => index ?? 0}
                        size="small"
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
                                width: 160,
                                render: (_, tier, index) => (
                                    <InputNumber
                                        controls={false}
                                        className="w-full"
                                        value={Number(tier.amount || 0)}
                                        min={0}
                                        step={0.01}
                                        onChange={(value) => {
                                            const next = [...data.price_tiers];
                                            next[index] = { ...tier, amount: String(value ?? '0') };
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
                                        onClick={() => {
                                            const next = data.price_tiers.filter((_, tierIndex) => tierIndex !== index);
                                            setData('price_tiers', next.length ? next : [{ label: '', amount: '' }]);
                                        }}
                                    >
                                        Del
                                    </Button>
                                ),
                            },
                        ]}
                    />
                </section>

                {Object.values(errors).length ? (
                    <section className="dp-section-block">
                        <div className="dp-error-text">{Object.values(errors).join(' | ')}</div>
                    </section>
                ) : null}

                <section className="dp-section-block">
                    <Space size={6}>
                        <Button type="primary" loading={processing} onClick={submit}>
                            Save Item
                        </Button>
                        <Button onClick={() => router.visit(paths.items.index)}>Cancel</Button>
                        <span>Active Price Tiers: {summary.tierCount}</span>
                    </Space>
                </section>
            </div>
        </AppShell>
    );
}
