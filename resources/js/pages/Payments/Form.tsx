import { BsDateInput } from '@/components/forms/BsDateInput';
import { CustomerLookupRecord, QuickAddCustomerModal } from '@/components/forms/QuickAddCustomerModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Card, Input, InputNumber, Select, Space, Typography } from 'antd';
import { useState } from 'react';

interface SupplierLookupRecord {
    id: number;
    name: string;
    code?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
    billingAddress?: string | null;
}

interface OpenInvoiceRecord {
    id: number;
    invoiceNumber: string;
    customerId: number;
    customerName: string;
    issueDate: string;
    balanceDue: string | number;
}

interface PaymentFormProps {
    mode: 'create' | 'edit';
    payment: {
        id: number | null;
        direction: 'received' | 'made';
        customer_id: number | null;
        supplier_id: number | null;
        invoice_id: number | null;
        payment_date: string;
        method: string;
        reference_number: string | null;
        amount: string;
        notes: string | null;
    };
    selected_customer: CustomerLookupRecord | null;
    selected_supplier: SupplierLookupRecord | null;
    selected_invoice: OpenInvoiceRecord | null;
    methods: string[];
}

export default function PaymentsForm({ mode, payment, selected_customer, selected_supplier, selected_invoice, methods }: PaymentFormProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [customerOption, setCustomerOption] = useState<LookupOption<CustomerLookupRecord> | null>(
        selected_customer
            ? {
                  value: selected_customer.id,
                  label: selected_customer.name,
                  record: selected_customer,
              }
            : null,
    );
    const [supplierOption, setSupplierOption] = useState<LookupOption<SupplierLookupRecord> | null>(
        selected_supplier
            ? {
                  value: selected_supplier.id,
                  label: selected_supplier.name,
                  record: selected_supplier,
              }
            : null,
    );
    const [invoiceOption, setInvoiceOption] = useState<LookupOption<OpenInvoiceRecord> | null>(
        selected_invoice
            ? {
                  value: selected_invoice.id,
                  label: selected_invoice.invoiceNumber,
                  record: selected_invoice,
              }
            : null,
    );
    const { data, setData, post, put, processing, errors, transform } = useForm({
        direction: payment.direction,
        customer_id: payment.customer_id,
        supplier_id: payment.supplier_id,
        invoice_id: payment.invoice_id,
        payment_date: payment.payment_date,
        method: payment.method,
        reference_number: payment.reference_number ?? '',
        amount: payment.amount,
        notes: payment.notes ?? '',
    });

    const submit = () => {
        transform((current) => ({
            ...current,
            reference_number: current.reference_number || null,
            notes: current.notes || null,
        }));

        if (mode === 'create') {
            post(paths.payments.store, {
                preserveScroll: true,
            });
            return;
        }

        put(paths.payments.update(payment.id as number), {
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
            title={mode === 'create' ? 'New Payment' : `Edit ${payment.id}`}
            subtitle="Use open invoice lookup for linked receipts, or record standalone customer/supplier payments when needed."
            activeKey="payments"
            extra={
                <Button type="primary" onClick={submit} loading={processing}>
                    Save Payment
                </Button>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card>
                    <div className="grid gap-4 xl:grid-cols-4">
                        <div>
                            <Typography.Text strong>Direction</Typography.Text>
                            <Select
                                className="w-full"
                                style={{ marginTop: 8 }}
                                value={data.direction}
                                onChange={(value) => {
                                    setData((current) => ({
                                        ...current,
                                        direction: value,
                                        customer_id: value === 'received' ? current.customer_id : null,
                                        invoice_id: value === 'received' ? current.invoice_id : null,
                                        supplier_id: value === 'made' ? current.supplier_id : null,
                                    }));
                                }}
                                options={[
                                    { value: 'received', label: 'Received' },
                                    { value: 'made', label: 'Made' },
                                ]}
                            />
                        </div>
                        <div>
                            <Typography.Text strong>Payment Date</Typography.Text>
                            <div style={{ marginTop: 8 }}>
                                <BsDateInput value={data.payment_date} onChange={(value) => setData('payment_date', value)} displayBsDates={useBsDates} placeholder="Payment date" />
                            </div>
                        </div>
                        <div>
                            <Typography.Text strong>Method</Typography.Text>
                            <Select
                                className="w-full"
                                style={{ marginTop: 8 }}
                                value={data.method}
                                onChange={(value) => setData('method', value)}
                                options={methods.map((method) => ({
                                    value: method,
                                    label: method,
                                }))}
                            />
                        </div>
                        <div>
                            <Typography.Text strong>Amount</Typography.Text>
                            <InputNumber className="w-full" style={{ marginTop: 8 }} value={Number(data.amount)} min={0} step={0.01} onChange={(value) => setData('amount', String(value ?? ''))} />
                        </div>

                        {data.direction === 'received' ? (
                            <>
                                <div className="xl:col-span-2">
                                    <Typography.Text strong>Customer</Typography.Text>
                                    <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                                        <div style={{ flex: 1 }}>
                                            <RemoteLookupSelect<CustomerLookupRecord>
                                                endpoint={paths.lookups.customers}
                                                value={customerOption}
                                                onChange={(option) => {
                                                    setCustomerOption(option);
                                                    setData('customer_id', option?.record.id ?? null);
                                                }}
                                                mapOption={(record) => ({
                                                    value: Number(record.id),
                                                    label: record.name,
                                                    record,
                                                })}
                                                placeholder="Search customer"
                                            />
                                        </div>
                                        <Button onClick={() => setCustomerModalOpen(true)}>+ Add Customer</Button>
                                    </Space.Compact>
                                </div>

                                <div className="xl:col-span-2">
                                    <Typography.Text strong>Open Invoice</Typography.Text>
                                    <div style={{ marginTop: 8 }}>
                                        <RemoteLookupSelect<OpenInvoiceRecord>
                                            endpoint={paths.lookups.openInvoices}
                                            value={invoiceOption}
                                            onChange={(option) => {
                                                setInvoiceOption(option);
                                                setData('invoice_id', option?.record.id ?? null);

                                                if (option) {
                                                    setData('customer_id', option.record.customerId);
                                                    setCustomerOption({
                                                        value: option.record.customerId,
                                                        label: option.record.customerName,
                                                        record: {
                                                            id: option.record.customerId,
                                                            name: option.record.customerName,
                                                        },
                                                    });
                                                    if (!Number(data.amount)) {
                                                        setData('amount', String(option.record.balanceDue));
                                                    }
                                                }
                                            }}
                                            mapOption={(record) => ({
                                                value: Number(record.id),
                                                label: `${record.invoiceNumber} (${record.customerName})`,
                                                record,
                                            })}
                                            placeholder="Search open invoices"
                                            allowClear
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="xl:col-span-2">
                                <Typography.Text strong>Supplier</Typography.Text>
                                <div style={{ marginTop: 8 }}>
                                    <RemoteLookupSelect<SupplierLookupRecord>
                                        endpoint={paths.lookups.suppliers}
                                        value={supplierOption}
                                        onChange={(option) => {
                                            setSupplierOption(option);
                                            setData('supplier_id', option?.record.id ?? null);
                                        }}
                                        mapOption={(record) => ({
                                            value: Number(record.id),
                                            label: record.name,
                                            record,
                                        })}
                                        placeholder="Search supplier"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="xl:col-span-2">
                            <Typography.Text strong>Reference Number</Typography.Text>
                            <Input style={{ marginTop: 8 }} value={data.reference_number ?? ''} onChange={(event) => setData('reference_number', event.target.value)} />
                        </div>
                        <div className="xl:col-span-4">
                            <Typography.Text strong>Notes</Typography.Text>
                            <Input.TextArea style={{ marginTop: 8 }} rows={4} value={data.notes ?? ''} onChange={(event) => setData('notes', event.target.value)} />
                        </div>
                    </div>

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
            </Space>

            <QuickAddCustomerModal
                open={customerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                onCreated={(option) => {
                    setCustomerOption(option);
                    setData('customer_id', option.record.id);
                }}
            />
        </AppShell>
    );
}
