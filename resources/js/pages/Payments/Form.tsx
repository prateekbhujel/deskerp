import { BsDateInput } from '@/components/forms/BsDateInput';
import { CustomerLookupRecord, QuickAddCustomerModal } from '@/components/forms/QuickAddCustomerModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { coerceNumber } from '@/lib/format';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Card, Input, InputNumber, Select, Space, Tag, Typography } from 'antd';
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

    const selectedPartyName = data.direction === 'received' ? customerOption?.record.name : supplierOption?.record.name;
    const selectedInvoiceBalance = coerceNumber(invoiceOption?.record.balanceDue);
    const enteredAmount = coerceNumber(data.amount);
    const balanceAfterPosting = selectedInvoiceBalance - enteredAmount;
    const overpaymentAmount = Math.max(enteredAmount - selectedInvoiceBalance, 0);
    const hasOverpayment = data.direction === 'received' && Boolean(invoiceOption) && overpaymentAmount > 0;

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
            allowInInputs: true,
            handler: () => submit(),
        },
        {
            key: 'c',
            alt: true,
            allowInInputs: true,
            handler: () => {
                if (data.direction === 'received') {
                    setCustomerModalOpen(true);
                }
            },
        },
        {
            key: 'i',
            alt: true,
            allowInInputs: true,
            handler: () => {
                const target = document.querySelector<HTMLElement>('[data-testid="payment-open-invoice-select"] .ant-select-selector');
                target?.click();
            },
        },
    ]);

    return (
        <AppShell
            title={mode === 'create' ? 'New Payment Entry' : 'Edit Payment Entry'}
            subtitle={data.direction === 'received' ? 'Ctrl+S save, Alt+C add customer, Alt+I search open invoice.' : 'Ctrl+S save payment voucher.'}
            activeKey="payments"
            extra={
                <Button data-testid="payment-save" type="primary" onClick={submit} loading={processing} disabled={hasOverpayment}>
                    Save Payment
                </Button>
            }
        >
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Card title="Payment Header" className="dp-dense-card">
                        <div className="grid gap-3 xl:grid-cols-12">
                            <div className="xl:col-span-2">
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
                                        if (value === 'made') {
                                            setInvoiceOption(null);
                                            setCustomerOption(null);
                                        }
                                    }}
                                    options={[
                                        { value: 'received', label: 'Receive' },
                                        { value: 'made', label: 'Make Payment' },
                                    ]}
                                />
                            </div>
                            <div className="xl:col-span-4">
                                <Typography.Text strong>Payment Date</Typography.Text>
                                <div style={{ marginTop: 8 }}>
                                    <BsDateInput value={data.payment_date} onChange={(value) => setData('payment_date', value)} displayBsDates={useBsDates} placeholder="Payment date" />
                                </div>
                            </div>
                            <div className="xl:col-span-2">
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
                            <div className="xl:col-span-2">
                                <Typography.Text strong>Amount</Typography.Text>
                                <InputNumber
                                    id="payment-amount-input"
                                    data-testid="payment-amount"
                                    className="w-full"
                                    style={{ marginTop: 8 }}
                                    value={Number(data.amount)}
                                    min={0}
                                    step={0.01}
                                    onChange={(value) => setData('amount', String(value ?? ''))}
                                />
                            </div>
                            <div className="xl:col-span-2">
                                <Typography.Text strong>Reference</Typography.Text>
                                <Input style={{ marginTop: 8 }} value={data.reference_number ?? ''} onChange={(event) => setData('reference_number', event.target.value)} />
                            </div>
                        </div>
                    </Card>

                    <Card title={data.direction === 'received' ? 'Receipt Allocation' : 'Payment Allocation'} className="dp-dense-card">
                        <div className="grid gap-3 xl:grid-cols-2">
                            {data.direction === 'received' ? (
                                <>
                                    <div>
                                        <Typography.Text strong>Customer Account</Typography.Text>
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
                                                    testId="payment-customer-select"
                                                />
                                            </div>
                                            <Button onClick={() => setCustomerModalOpen(true)}>+ Customer</Button>
                                        </Space.Compact>
                                    </div>

                                    <div>
                                        <Typography.Text strong>Against Invoice</Typography.Text>
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
                                                testId="payment-open-invoice-select"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Typography.Text strong>Supplier Account</Typography.Text>
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
                                            testId="payment-supplier-select"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={data.direction === 'received' ? '' : 'xl:col-span-1'}>
                                <Typography.Text strong>Notes / Narration</Typography.Text>
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

                        {hasOverpayment ? (
                            <Typography.Text type="danger" style={{ display: 'block', marginTop: 12 }}>
                                Amount exceeds outstanding by {overpaymentAmount.toFixed(2)}. Reduce amount before saving.
                            </Typography.Text>
                        ) : null}
                    </Card>
                </Space>

                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Card title="Summary" className="dp-dense-card">
                        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                            <div className="dp-queue-card">
                                <Typography.Text type="secondary">Entry Type</Typography.Text>
                                <Typography.Title level={5} style={{ margin: '6px 0 0' }}>
                                    {data.direction === 'received' ? 'Receipt' : 'Payment'}
                                </Typography.Title>
                                <Tag color={data.direction === 'received' ? 'green' : 'orange'}>{data.direction === 'received' ? 'Receive' : 'Make Payment'}</Tag>
                            </div>
                            <div className="dp-queue-card">
                                <Typography.Text type="secondary">Party</Typography.Text>
                                <Typography.Title level={5} style={{ margin: '6px 0 0' }}>
                                    {selectedPartyName || 'Select account'}
                                </Typography.Title>
                            </div>
                            {data.direction === 'received' ? (
                                <div className="dp-queue-card">
                                    <Typography.Text type="secondary">Invoice Balance</Typography.Text>
                                    <Typography.Title level={5} style={{ margin: '6px 0 0' }}>
                                        {invoiceOption?.record.invoiceNumber || 'No linked invoice'}
                                    </Typography.Title>
                                    <div className="mt-2 space-y-1">
                                        <div className="dp-summary-row">
                                            <span>Outstanding</span>
                                            <strong>{selectedInvoiceBalance.toFixed(2)}</strong>
                                        </div>
                                        <div className="dp-summary-row">
                                            <span>Posting Now</span>
                                            <strong>{enteredAmount.toFixed(2)}</strong>
                                        </div>
                                        <div className="dp-summary-row dp-summary-row-total">
                                            <span>Balance Left</span>
                                            <strong>{Math.max(balanceAfterPosting, 0).toFixed(2)}</strong>
                                        </div>
                                        {hasOverpayment ? (
                                            <div className="dp-summary-row">
                                                <span>Over by</span>
                                                <strong>{overpaymentAmount.toFixed(2)}</strong>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                            <div className="dp-queue-card">
                                <Typography.Text type="secondary">Shortcut Strip</Typography.Text>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="dp-kbd">Ctrl+S</span>
                                    {data.direction === 'received' ? <span className="dp-kbd">Alt+C</span> : null}
                                    {data.direction === 'received' ? <span className="dp-kbd">Alt+I</span> : null}
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Space>
            </div>

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
