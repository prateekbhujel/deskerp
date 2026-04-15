import { paths } from '@/lib/paths';
import { LookupOption } from '@/types/shared';
import axios from 'axios';
import { Button, Form, Input, InputNumber, Modal, Switch } from 'antd';
import { useEffect, useState } from 'react';

export interface CustomerLookupRecord {
    id: number;
    name: string;
    code?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
    billingAddress?: string | null;
}

interface QuickAddCustomerModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (option: LookupOption<CustomerLookupRecord>) => void;
}

export function QuickAddCustomerModal({ open, onClose, onCreated }: QuickAddCustomerModalProps) {
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
            const response = await axios.post<CustomerLookupRecord>(paths.customers.store, values, {
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
            title="Add Customer"
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" loading={submitting} onClick={submit}>
                    Save Customer
                </Button>,
            ]}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    is_active: true,
                    opening_balance: 0,
                    credit_limit: 0,
                }}
            >
                <Form.Item label="Name" name="name" help={errors.name} validateStatus={errors.name ? 'error' : ''} rules={[{ required: true }]}>
                    <Input data-testid="quick-customer-name" />
                </Form.Item>
                <Form.Item label="Code" name="code" help={errors.code} validateStatus={errors.code ? 'error' : ''}>
                    <Input data-testid="quick-customer-code" />
                </Form.Item>
                <Form.Item label="Phone" name="phone" help={errors.phone} validateStatus={errors.phone ? 'error' : ''}>
                    <Input data-testid="quick-customer-phone" />
                </Form.Item>
                <Form.Item label="Email" name="email" help={errors.email} validateStatus={errors.email ? 'error' : ''}>
                    <Input data-testid="quick-customer-email" />
                </Form.Item>
                <Form.Item label="Billing Address" name="billing_address" help={errors.billing_address} validateStatus={errors.billing_address ? 'error' : ''}>
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item label="Opening Balance" name="opening_balance" help={errors.opening_balance} validateStatus={errors.opening_balance ? 'error' : ''}>
                    <InputNumber className="w-full" min={0} step={0.01} />
                </Form.Item>
                <Form.Item label="Credit Limit" name="credit_limit" help={errors.credit_limit} validateStatus={errors.credit_limit ? 'error' : ''}>
                    <InputNumber className="w-full" min={0} step={0.01} />
                </Form.Item>
                <Form.Item label="Active" name="is_active" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
}
