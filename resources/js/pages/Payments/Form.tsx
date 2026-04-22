import { BsDateInput } from '@/components/forms/BsDateInput';
import { CustomerLookupRecord, QuickAddCustomerModal } from '@/components/forms/QuickAddCustomerModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { coerceNumber } from '@/lib/format';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Input, InputNumber, Select, Space } from 'antd';
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
    const { isMac, shortcuts } = usePlatformShortcuts();
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

    const clearForm = () => {
        setCustomerOption(null);
        setSupplierOption(null);
        setInvoiceOption(null);
        setData({
            direction: payment.direction,
            customer_id: null,
            supplier_id: null,
            invoice_id: null,
            payment_date: payment.payment_date,
            method: payment.method,
            reference_number: '',
            amount: '0.00',
            notes: '',
        });
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
        {
            key: 'a',
            alt: true,
            allowInInputs: true,
            handler: () => document.getElementById('payment-amount-input')?.focus(),
        },
        {
            key: 'x',
            alt: true,
            allowInInputs: true,
            handler: () => clearForm(),
        },
        {
            key: 'o',
            alt: true,
            allowInInputs: true,
            handler: () => document.getElementById('payment-notes-field')?.focus(),
        },
    ]);

    return (
        <AppShell
            title={mode === 'create' ? 'New Payment Entry' : 'Edit Payment Entry'}
            subtitle={`Voucher entry | ${shortcuts.save} save | ${shortcuts.searchInvoice} invoice search`}
            activeKey="payments"
            mode={mode === 'create' ? 'Draft' : 'Posted'}
            extra={
                <Space size={6} wrap>
                    <Button data-testid="payment-save" type="primary" onClick={submit} loading={processing} disabled={hasOverpayment}>
                        Save Payment
                    </Button>
                    <Button onClick={clearForm}>Clear ({shortcuts.clearForm})</Button>
                </Space>
            }
        >
            <div className="dp-form-page" data-shortcut-scope="voucher">
                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Voucher Header</h3>
                    </div>
                    <div className="dp-form-section-body">
                        <div className="dp-form-grid">
                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Direction</label>
                                <Select
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
                                        { value: 'received', label: 'Receive Payment' },
                                        { value: 'made', label: 'Make Payment' },
                                    ]}
                                />
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-3">
                                <label className="dp-field-label">Payment Date</label>
                                <BsDateInput value={data.payment_date} onChange={(value) => setData('payment_date', value)} displayBsDates={useBsDates} placeholder="Payment date" />
                                {errors.payment_date ? <span className="dp-error-text">{errors.payment_date}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Method</label>
                                <Select
                                    value={data.method}
                                    onChange={(value) => setData('method', value)}
                                    options={methods.map((method) => ({
                                        value: method,
                                        label: method,
                                    }))}
                                />
                                {errors.method ? <span className="dp-error-text">{errors.method}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Amount</label>
                                <InputNumber
                                    id="payment-amount-input"
                                    data-testid="payment-amount"
                                    className="w-full"
                                    value={Number(data.amount)}
                                    min={0}
                                    step={0.01}
                                    onChange={(value) => setData('amount', String(value ?? ''))}
                                />
                                {errors.amount ? <span className="dp-error-text">{errors.amount}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-3">
                                <label className="dp-field-label">Reference</label>
                                <Input value={data.reference_number ?? ''} onChange={(event) => setData('reference_number', event.target.value)} placeholder="Voucher reference" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Allocation</h3>
                        <Space size={6}>
                            <span className="dp-kbd">{shortcuts.focusAmount}</span>
                            <span className="dp-kbd">{shortcuts.clearForm}</span>
                        </Space>
                    </div>
                    <div className="dp-form-section-body">
                        <div className="dp-form-grid">
                            {data.direction === 'received' ? (
                                <>
                                    <div className="dp-field col-span-12 xl:col-span-4">
                                        <label className="dp-field-label">Customer Account</label>
                                        <Space.Compact style={{ width: '100%' }}>
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
                                            <Button onClick={() => setCustomerModalOpen(true)}>Customer</Button>
                                        </Space.Compact>
                                        {errors.customer_id ? <span className="dp-error-text">{errors.customer_id}</span> : null}
                                    </div>

                                    <div className="dp-field col-span-12 xl:col-span-4">
                                        <label className="dp-field-label">Against Invoice</label>
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
                                        {errors.invoice_id ? <span className="dp-error-text">{errors.invoice_id}</span> : null}
                                    </div>
                                </>
                            ) : (
                                <div className="dp-field col-span-12 xl:col-span-4">
                                    <label className="dp-field-label">Supplier Account</label>
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
                                    {errors.supplier_id ? <span className="dp-error-text">{errors.supplier_id}</span> : null}
                                </div>
                            )}

                            <div className="dp-field col-span-12 xl:col-span-4">
                                <label className="dp-field-label">Notes / Narration</label>
                                <Input.TextArea
                                    id="payment-notes-field"
                                    rows={3}
                                    value={data.notes ?? ''}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    placeholder="Narration or payment remarks"
                                />
                                {errors.notes ? <span className="dp-error-text">{errors.notes}</span> : null}
                            </div>
                        </div>

                        {hasOverpayment ? <div className="dp-error-text">Amount exceeds outstanding by {overpaymentAmount.toFixed(2)}.</div> : null}
                    </div>
                </section>

                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Summary</h3>
                        <span>{data.direction === 'received' ? 'Receipt' : 'Payment'}</span>
                    </div>
                    <div className="dp-form-section-body">
                        <div className="dp-summary-grid">
                            <span>Party</span>
                            <strong>{selectedPartyName || '-'}</strong>
                            <span>Amount</span>
                            <strong>{enteredAmount.toFixed(2)}</strong>
                            <span>Method</span>
                            <strong>{data.method || '-'}</strong>
                            {data.direction === 'received' ? (
                                <>
                                    <span>Outstanding</span>
                                    <strong>{selectedInvoiceBalance.toFixed(2)}</strong>
                                    <span className="dp-summary-total">Balance Left</span>
                                    <strong className="dp-summary-total">{Math.max(balanceAfterPosting, 0).toFixed(2)}</strong>
                                </>
                            ) : null}
                        </div>

                        <div style={{ marginTop: 8 }}>
                            <Space size={6} wrap>
                                <span className="dp-kbd">{shortcuts.save}</span>
                                <span className="dp-kbd">{shortcuts.addCustomer}</span>
                                <span className="dp-kbd">{shortcuts.searchInvoice}</span>
                                <span className="dp-kbd">{shortcuts.notesField}</span>
                            </Space>
                        </div>
                    </div>
                </section>
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
