import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { paths } from '@/lib/paths';
import { router, useForm } from '@inertiajs/react';
import { Button, Input, InputNumber, Select } from 'antd';

interface CustomersFormProps {
    mode: 'create' | 'edit';
    customer: {
        id: number | null;
        code: string | null;
        name: string;
        contact_person: string | null;
        phone: string | null;
        email: string | null;
        tax_number: string | null;
        billing_address: string | null;
        shipping_address: string | null;
        opening_balance: string;
        credit_limit: string;
        notes: string | null;
        is_active: boolean;
    };
}

export default function CustomersForm({ mode, customer }: CustomersFormProps) {
    const { isMac } = usePlatformShortcuts();
    const { data, setData, post, put, processing, errors, transform } = useForm({
        code: customer.code ?? '',
        name: customer.name ?? '',
        contact_person: customer.contact_person ?? '',
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        tax_number: customer.tax_number ?? '',
        billing_address: customer.billing_address ?? '',
        shipping_address: customer.shipping_address ?? '',
        opening_balance: customer.opening_balance ?? '0.00',
        credit_limit: customer.credit_limit ?? '0.00',
        notes: customer.notes ?? '',
        is_active: customer.is_active,
    });

    const submit = () => {
        transform((current) => ({
            ...current,
            opening_balance: Number(current.opening_balance || 0),
            credit_limit: Number(current.credit_limit || 0),
        }));

        if (mode === 'create') {
            post(paths.customers.store, { preserveScroll: true });
            return;
        }

        put(paths.customers.update(customer.id as number), { preserveScroll: true });
    };

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: !isMac,
            meta: isMac,
            allowInInputs: true,
            handler: () => submit(),
        },
        {
            key: 'Escape',
            allowInInputs: true,
            handler: () => router.visit(paths.customers.index),
        },
    ]);

    return (
        <AppShell title={mode === 'create' ? 'Customer Master' : `Customer Master ${customer.name}`} subtitle="Customer Entry" activeKey="customers">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Header</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Code</label>
                            <Input value={data.code} onChange={(event) => setData('code', event.target.value)} />
                            {errors.code ? <span className="dp-error-text">{errors.code}</span> : null}
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-4">
                            <label className="dp-field-label">Customer Name</label>
                            <Input data-testid="customer-name-input" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {errors.name ? <span className="dp-error-text">{errors.name}</span> : null}
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Contact Person</label>
                            <Input value={data.contact_person} onChange={(event) => setData('contact_person', event.target.value)} />
                            {errors.contact_person ? <span className="dp-error-text">{errors.contact_person}</span> : null}
                        </div>

                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Status</label>
                            <Select
                                value={data.is_active ? 'active' : 'inactive'}
                                onChange={(value) => setData('is_active', value === 'active')}
                                options={[
                                    { value: 'active', label: 'ACTIVE' },
                                    { value: 'inactive', label: 'INACTIVE' },
                                ]}
                            />
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Contact</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Phone</label>
                            <Input value={data.phone} onChange={(event) => setData('phone', event.target.value)} />
                            {errors.phone ? <span className="dp-error-text">{errors.phone}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Email</label>
                            <Input value={data.email} onChange={(event) => setData('email', event.target.value)} />
                            {errors.email ? <span className="dp-error-text">{errors.email}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Tax Number</label>
                            <Input value={data.tax_number} onChange={(event) => setData('tax_number', event.target.value)} />
                            {errors.tax_number ? <span className="dp-error-text">{errors.tax_number}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Opening Balance</label>
                            <InputNumber
                                className="w-full"
                                controls={false}
                                min={0}
                                step={0.01}
                                value={Number(data.opening_balance || 0)}
                                onChange={(value) => setData('opening_balance', String(value ?? '0'))}
                                onBlur={() => setData('opening_balance', Number(data.opening_balance || 0).toFixed(2))}
                            />
                            {errors.opening_balance ? <span className="dp-error-text">{errors.opening_balance}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Credit Limit</label>
                            <InputNumber
                                className="w-full"
                                controls={false}
                                min={0}
                                step={0.01}
                                value={Number(data.credit_limit || 0)}
                                onChange={(value) => setData('credit_limit', String(value ?? '0'))}
                                onBlur={() => setData('credit_limit', Number(data.credit_limit || 0).toFixed(2))}
                            />
                            {errors.credit_limit ? <span className="dp-error-text">{errors.credit_limit}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-9">
                            <label className="dp-field-label">Billing Address</label>
                            <Input.TextArea rows={2} value={data.billing_address} onChange={(event) => setData('billing_address', event.target.value)} />
                            {errors.billing_address ? <span className="dp-error-text">{errors.billing_address}</span> : null}
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-9">
                            <label className="dp-field-label">Shipping Address</label>
                            <Input.TextArea rows={2} value={data.shipping_address} onChange={(event) => setData('shipping_address', event.target.value)} />
                            {errors.shipping_address ? <span className="dp-error-text">{errors.shipping_address}</span> : null}
                        </div>
                        <div className="dp-field col-span-12">
                            <label className="dp-field-label">Notes</label>
                            <Input.TextArea rows={3} value={data.notes} onChange={(event) => setData('notes', event.target.value)} />
                            {errors.notes ? <span className="dp-error-text">{errors.notes}</span> : null}
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Actions</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Button type="primary" onClick={() => submit()} loading={processing}>
                            Save
                        </Button>
                        <Button onClick={() => router.visit(paths.customers.index)}>Cancel</Button>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
