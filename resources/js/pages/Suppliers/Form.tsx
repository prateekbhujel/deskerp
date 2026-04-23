import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { paths } from '@/lib/paths';
import { router, useForm } from '@inertiajs/react';
import { Button, Input, InputNumber, Select } from 'antd';

interface SuppliersFormProps {
    mode: 'create' | 'edit';
    supplier: {
        id: number | null;
        code: string | null;
        name: string;
        contact_person: string | null;
        phone: string | null;
        email: string | null;
        tax_number: string | null;
        billing_address: string | null;
        opening_balance: string;
        notes: string | null;
        is_active: boolean;
    };
}

export default function SuppliersForm({ mode, supplier }: SuppliersFormProps) {
    const { isMac } = usePlatformShortcuts();
    const { data, setData, post, put, processing, errors, transform } = useForm({
        code: supplier.code ?? '',
        name: supplier.name ?? '',
        contact_person: supplier.contact_person ?? '',
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        tax_number: supplier.tax_number ?? '',
        billing_address: supplier.billing_address ?? '',
        opening_balance: supplier.opening_balance ?? '0.00',
        notes: supplier.notes ?? '',
        is_active: supplier.is_active,
    });

    const submit = () => {
        transform((current) => ({
            ...current,
            opening_balance: Number(current.opening_balance || 0),
        }));

        if (mode === 'create') {
            post(paths.suppliers.store, { preserveScroll: true });
            return;
        }

        put(paths.suppliers.update(supplier.id as number), { preserveScroll: true });
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
            handler: () => router.visit(paths.suppliers.index),
        },
    ]);

    return (
        <AppShell title={mode === 'create' ? 'Supplier Master' : `Supplier Master ${supplier.name}`} subtitle="Supplier Entry" activeKey="suppliers">
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
                            <label className="dp-field-label">Supplier Name</label>
                            <Input data-testid="supplier-name-input" value={data.name} onChange={(event) => setData('name', event.target.value)} />
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
                        <div className="dp-field col-span-12 xl:col-span-9">
                            <label className="dp-field-label">Billing Address</label>
                            <Input.TextArea rows={2} value={data.billing_address} onChange={(event) => setData('billing_address', event.target.value)} />
                            {errors.billing_address ? <span className="dp-error-text">{errors.billing_address}</span> : null}
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
                        <Button onClick={() => router.visit(paths.suppliers.index)}>Cancel</Button>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
