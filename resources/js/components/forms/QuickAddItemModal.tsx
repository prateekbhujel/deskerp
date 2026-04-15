import { paths } from '@/lib/paths';
import { LookupOption, SimpleOption } from '@/types/shared';
import axios from 'axios';
import { Button, Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';

export interface ItemLookupRecord {
    id: number;
    name: string;
    sku?: string | null;
    unit?: string | null;
    sellingPrice: string | number;
    taxRate: string | number;
    trackInventory: boolean;
    currentStock: string | number;
}

interface QuickAddItemModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (option: LookupOption<ItemLookupRecord>) => void;
    units: SimpleOption[];
    categories: SimpleOption[];
}

export function QuickAddItemModal({ open, onClose, onCreated, units, categories }: QuickAddItemModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setErrors({});
        }
    }, [form, open]);

    const submit = async () => {
        setSubmitting(true);
        setErrors({});

        try {
            const values = await form.validateFields();
            const response = await axios.post<ItemLookupRecord>(paths.items.store, values, {
                headers: {
                    Accept: 'application/json',
                },
            });

            const record = response.data;

            onCreated({
                value: record.id,
                label: record.name,
                record,
            });
            onClose();
        } catch (error: any) {
            if (error?.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
                return;
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            title="Add Item"
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" loading={submitting} onClick={submit}>
                    Save Item
                </Button>,
            ]}
            width={720}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    item_type: 'stockable',
                    base_price: 0,
                    selling_price: 0,
                    tax_rate: 0,
                    opening_stock: 0,
                    reorder_level: 0,
                    allow_discount: true,
                    track_inventory: true,
                    is_active: true,
                }}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <Form.Item label="Item Name" name="name" help={errors.name} validateStatus={errors.name ? 'error' : ''} rules={[{ required: true }]}>
                        <Input data-testid="quick-item-name" />
                    </Form.Item>
                    <Form.Item label="SKU" name="sku" help={errors.sku} validateStatus={errors.sku ? 'error' : ''}>
                        <Input data-testid="quick-item-sku" />
                    </Form.Item>
                    <Form.Item label="Unit" name="unit_id" help={errors.unit_id} validateStatus={errors.unit_id ? 'error' : ''} rules={[{ required: true }]}>
                        <Select data-testid="quick-item-unit" options={units.map((unit) => ({ value: unit.id, label: unit.name }))} />
                    </Form.Item>
                    <Form.Item label="Category" name="category_id" help={errors.category_id} validateStatus={errors.category_id ? 'error' : ''}>
                        <Select allowClear options={categories.map((category) => ({ value: category.id, label: category.name }))} />
                    </Form.Item>
                    <Form.Item label="Item Type" name="item_type" help={errors.item_type} validateStatus={errors.item_type ? 'error' : ''}>
                        <Select
                            options={[
                                { value: 'stockable', label: 'Stockable' },
                                { value: 'service', label: 'Service' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Tax Rate %" name="tax_rate" help={errors.tax_rate} validateStatus={errors.tax_rate ? 'error' : ''}>
                        <InputNumber id="quick-item-tax-rate" data-testid="quick-item-tax-rate" className="w-full" min={0} step={0.01} />
                    </Form.Item>
                    <Form.Item label="Base Price" name="base_price" help={errors.base_price} validateStatus={errors.base_price ? 'error' : ''}>
                        <InputNumber id="quick-item-base-price" data-testid="quick-item-base-price" className="w-full" min={0} step={0.01} />
                    </Form.Item>
                    <Form.Item label="Selling Price" name="selling_price" help={errors.selling_price} validateStatus={errors.selling_price ? 'error' : ''} rules={[{ required: true }]}>
                        <InputNumber id="quick-item-selling-price" data-testid="quick-item-selling-price" className="w-full" min={0} step={0.01} />
                    </Form.Item>
                    <Form.Item label="Opening Stock" name="opening_stock" help={errors.opening_stock} validateStatus={errors.opening_stock ? 'error' : ''}>
                        <InputNumber id="quick-item-opening-stock" data-testid="quick-item-opening-stock" className="w-full" min={0} step={0.001} />
                    </Form.Item>
                    <Form.Item label="Reorder Level" name="reorder_level" help={errors.reorder_level} validateStatus={errors.reorder_level ? 'error' : ''}>
                        <InputNumber className="w-full" min={0} step={0.001} />
                    </Form.Item>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Form.Item label="Allow Discount" name="allow_discount" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="Track Inventory" name="track_inventory" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="Active" name="is_active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
}
