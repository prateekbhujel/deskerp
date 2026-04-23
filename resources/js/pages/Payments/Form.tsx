import { BsDateInput } from '@/components/forms/BsDateInput';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { coerceNumber } from '@/lib/format';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps } from '@/types/shared';
import { router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Button, Input, InputNumber, Modal, Select, Space } from 'antd';
import { KeyboardEvent as ReactKeyboardEvent, useState } from 'react';

interface CustomerLookupRecord {
    id: number;
    name: string;
    code?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
    billingAddress?: string | null;
}

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
    const { isMac } = usePlatformShortcuts();

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

    const [showQuickCustomer, setShowQuickCustomer] = useState(false);
    const [quickCustomerSaving, setQuickCustomerSaving] = useState(false);
    const [quickCustomerErrors, setQuickCustomerErrors] = useState<Record<string, string>>({});
    const [quickCustomerData, setQuickCustomerData] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
        billing_address: '',
        opening_balance: 0,
        credit_limit: 0,
        is_active: true,
    });

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

    const selectedInvoiceBalance = coerceNumber(invoiceOption?.record.balanceDue);
    const enteredAmount = coerceNumber(data.amount);
    const overpaymentAmount = Math.max(enteredAmount - selectedInvoiceBalance, 0);
    const hasOverpayment = data.direction === 'received' && Boolean(invoiceOption) && overpaymentAmount > 0;
    const balanceAfter = Math.max(selectedInvoiceBalance - enteredAmount, 0);

    const submit = () => {
        transform((current) => ({
            ...current,
            reference_number: current.reference_number || null,
            notes: current.notes || null,
        }));

        if (mode === 'create') {
            post(paths.payments.store, { preserveScroll: true });
            return;
        }

        put(paths.payments.update(payment.id as number), { preserveScroll: true });
    };

    const clearForm = () => {
        setCustomerOption(null);
        setSupplierOption(null);
        setInvoiceOption(null);
        setShowQuickCustomer(false);
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

    const saveQuickCustomer = async () => {
        setQuickCustomerSaving(true);
        setQuickCustomerErrors({});

        try {
            const response = await axios.post<CustomerLookupRecord>(paths.customers.store, quickCustomerData, {
                headers: { Accept: 'application/json' },
            });
            const record = response.data;
            const option: LookupOption<CustomerLookupRecord> = {
                value: record.id,
                label: record.name,
                record,
            };
            setCustomerOption(option);
            setData('customer_id', record.id);
            setShowQuickCustomer(false);
            setQuickCustomerData({
                name: '',
                code: '',
                phone: '',
                email: '',
                billing_address: '',
                opening_balance: 0,
                credit_limit: 0,
                is_active: true,
            });
        } catch (error: any) {
            if (error?.response?.status === 422) {
                setQuickCustomerErrors(error.response.data.errors ?? {});
            }
        } finally {
            setQuickCustomerSaving(false);
        }
    };

    const handleVoucherKey = (event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' || event.shiftKey) {
            return;
        }

        event.preventDefault();
        const fields = [...document.querySelectorAll<HTMLElement>('[data-voucher-field="true"]')];
        const index = fields.findIndex((field) => field === event.currentTarget);
        if (index >= 0) {
            fields[index + 1]?.focus();
        }
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
        {
            key: 'i',
            alt: true,
            allowInInputs: true,
            handler: () => {
                const target = document.querySelector<HTMLElement>('[data-testid="payment-open-invoice-select"] .ant-select-selector');
                target?.focus();
                target?.click();
            },
        },
        {
            key: 'c',
            alt: true,
            allowInInputs: true,
            handler: () => {
                if (data.direction === 'received') {
                    setShowQuickCustomer(true);
                }
            },
        },
        {
            key: 'Escape',
            allowInInputs: true,
            handler: () => router.visit(paths.payments.index),
        },
    ]);

    return (
        <AppShell
            title={mode === 'create' ? 'Payment Voucher' : `Payment Voucher ${selected_invoice?.invoiceNumber ?? ''}`}
            subtitle="Payment Entry"
            activeKey="payments"
            mode={mode === 'create' ? 'Draft' : 'Posted'}
        >
            <div className="dp-form-page" data-shortcut-scope="voucher">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Voucher Header</h3>
                    </div>
                    <div className="dp-section-body">
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

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Date</label>
                                <BsDateInput value={data.payment_date} onChange={(value) => setData('payment_date', value)} displayBsDates={useBsDates} />
                                {errors.payment_date ? <span className="dp-error-text">{errors.payment_date}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Method</label>
                                <Select
                                    value={data.method}
                                    onChange={(value) => setData('method', value)}
                                    options={methods.map((method) => ({ value: method, label: method.toUpperCase() }))}
                                />
                                {errors.method ? <span className="dp-error-text">{errors.method}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Amount</label>
                                <InputNumber
                                    controls={false}
                                    id="payment-amount-input"
                                    data-testid="payment-amount"
                                    data-voucher-field="true"
                                    className="w-full"
                                    value={Number(data.amount)}
                                    min={0}
                                    step={0.01}
                                    onChange={(value) => setData('amount', String(value ?? '0'))}
                                    onBlur={() => setData('amount', Number(data.amount || 0).toFixed(2))}
                                    onKeyDown={handleVoucherKey}
                                />
                                {errors.amount ? <span className="dp-error-text">{errors.amount}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-4">
                                <label className="dp-field-label">Reference</label>
                                <Input
                                    data-voucher-field="true"
                                    value={data.reference_number ?? ''}
                                    onChange={(event) => setData('reference_number', event.target.value)}
                                    onKeyDown={handleVoucherKey}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Allocation</h3>
                        {data.direction === 'received' ? <Button onClick={() => setShowQuickCustomer(true)}>Add Customer</Button> : null}
                    </div>
                    <div className="dp-section-body">
                        <div className="dp-form-grid">
                            {data.direction === 'received' ? (
                                <>
                                    <div className="dp-field col-span-12 xl:col-span-4">
                                        <label className="dp-field-label">Customer</label>
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
                                            testId="payment-customer-select"
                                        />
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
                                                        setData('amount', Number(option.record.balanceDue || 0).toFixed(2));
                                                    }
                                                }
                                            }}
                                            mapOption={(record) => ({
                                                value: Number(record.id),
                                                label: `${record.invoiceNumber} (${record.customerName})`,
                                                record,
                                            })}
                                            testId="payment-open-invoice-select"
                                        />
                                        {errors.invoice_id ? <span className="dp-error-text">{errors.invoice_id}</span> : null}
                                    </div>
                                </>
                            ) : (
                                <div className="dp-field col-span-12 xl:col-span-4">
                                    <label className="dp-field-label">Supplier</label>
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
                                        testId="payment-supplier-select"
                                    />
                                    {errors.supplier_id ? <span className="dp-error-text">{errors.supplier_id}</span> : null}
                                </div>
                            )}

                            <div className="dp-field col-span-12 xl:col-span-8">
                                <label className="dp-field-label">Narration</label>
                                <Input.TextArea
                                    id="payment-notes-field"
                                    rows={2}
                                    data-voucher-field="true"
                                    value={data.notes ?? ''}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    onKeyDown={handleVoucherKey}
                                />
                                {errors.notes ? <span className="dp-error-text">{errors.notes}</span> : null}
                            </div>
                        </div>

                        {hasOverpayment ? <div className="dp-error-text" style={{ marginTop: 6 }}>Amount exceeds outstanding by {overpaymentAmount.toFixed(2)}.</div> : null}
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Summary</h3>
                    </div>
                    <div className="dp-summary-grid">
                        <span>Entry</span>
                        <strong>{data.direction === 'received' ? 'Receive Payment' : 'Make Payment'}</strong>
                        <span>Amount</span>
                        <strong>{enteredAmount.toFixed(2)}</strong>
                        <span>Method</span>
                        <strong>{data.method.toUpperCase()}</strong>
                        {data.direction === 'received' ? (
                            <>
                                <span>Outstanding</span>
                                <strong>{selectedInvoiceBalance.toFixed(2)}</strong>
                                <span className="dp-summary-total">Balance Left</span>
                                <strong className="dp-summary-total">{balanceAfter.toFixed(2)}</strong>
                            </>
                        ) : null}
                    </div>
                </section>

                <section className="dp-section-block">
                    <Space size={6}>
                        <Button data-testid="payment-save" type="primary" onClick={submit} loading={processing} disabled={hasOverpayment}>
                            Save
                        </Button>
                        <Button onClick={clearForm}>Clear</Button>
                        <Button onClick={() => router.visit(paths.payments.index)}>Cancel</Button>
                    </Space>
                </section>
            </div>

            <Modal
                open={showQuickCustomer && data.direction === 'received'}
                title="Add Customer"
                onCancel={() => setShowQuickCustomer(false)}
                footer={null}
                destroyOnClose
            >
                <div className="dp-form-grid">
                    <div className="dp-field col-span-12">
                        <label className="dp-field-label">Name</label>
                        <Input
                            value={quickCustomerData.name}
                            onChange={(event) =>
                                setQuickCustomerData((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                        />
                        {quickCustomerErrors.name ? <span className="dp-error-text">{quickCustomerErrors.name}</span> : null}
                    </div>
                    <div className="dp-field col-span-12 xl:col-span-4">
                        <label className="dp-field-label">Code</label>
                        <Input
                            value={quickCustomerData.code}
                            onChange={(event) =>
                                setQuickCustomerData((current) => ({
                                    ...current,
                                    code: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="dp-field col-span-12 xl:col-span-4">
                        <label className="dp-field-label">Phone</label>
                        <Input
                            value={quickCustomerData.phone}
                            onChange={(event) =>
                                setQuickCustomerData((current) => ({
                                    ...current,
                                    phone: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="dp-field col-span-12 xl:col-span-4">
                        <label className="dp-field-label">Email</label>
                        <Input
                            value={quickCustomerData.email}
                            onChange={(event) =>
                                setQuickCustomerData((current) => ({
                                    ...current,
                                    email: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="dp-field col-span-12">
                        <label className="dp-field-label">Address</label>
                        <Input
                            value={quickCustomerData.billing_address}
                            onChange={(event) =>
                                setQuickCustomerData((current) => ({
                                    ...current,
                                    billing_address: event.target.value,
                                }))
                            }
                        />
                    </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button onClick={() => setShowQuickCustomer(false)}>Cancel</Button>
                    <Button type="primary" onClick={saveQuickCustomer} loading={quickCustomerSaving}>
                        Save Customer
                    </Button>
                </div>
            </Modal>
        </AppShell>
    );
}
