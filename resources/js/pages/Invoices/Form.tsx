import { BsDateInput } from '@/components/forms/BsDateInput';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { calculateInvoiceLinePreview, calculateInvoicePreview, InvoiceLineDraft } from '@/lib/invoice';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps, SimpleOption } from '@/types/shared';
import { router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Button, Input, InputNumber, Select, Space } from 'antd';
import { KeyboardEvent as ReactKeyboardEvent, useMemo, useState } from 'react';

interface CustomerLookupRecord {
    id: number;
    name: string;
    code?: string | null;
    phone?: string | null;
    email?: string | null;
    taxNumber?: string | null;
    billingAddress?: string | null;
}

interface ItemLookupRecord {
    id: number;
    name: string;
    sku?: string | null;
    unit?: string | null;
    sellingPrice: string | number;
    taxRate: string | number;
    trackInventory: boolean;
    currentStock: string | number;
}

interface InvoiceLineInput {
    item_id: number | null;
    description: string;
    unit_name: string;
    quantity: string;
    rate: string;
    discount_percent: string;
    tax_percent: string;
}

interface InvoiceFormPageProps {
    mode: 'create' | 'edit';
    invoice: {
        id: number | null;
        invoice_number: string | null;
        customer_id: number | null;
        issue_date: string | null;
        due_date: string | null;
        status: 'draft' | 'final';
        reference_number: string;
        notes: string;
        lines: InvoiceLineInput[];
    };
    selected_customer: CustomerLookupRecord | null;
    selected_line_items: Array<{
        line_index: number;
        item: ItemLookupRecord;
    }>;
    support: {
        units: SimpleOption[];
        categories: SimpleOption[];
    };
}

function blankLine(): InvoiceLineInput {
    return {
        item_id: null,
        description: '',
        unit_name: '',
        quantity: '1.000',
        rate: '0.00',
        discount_percent: '0.00',
        tax_percent: '0.00',
    };
}

function isRowRemovable(line: InvoiceLineInput): boolean {
    return (
        !line.item_id &&
        line.description.trim() === '' &&
        line.unit_name.trim() === '' &&
        Number(line.quantity || 0) <= 1 &&
        Number(line.rate || 0) === 0 &&
        Number(line.discount_percent || 0) === 0 &&
        Number(line.tax_percent || 0) === 0
    );
}

export default function InvoiceForm({ mode, invoice, selected_customer, selected_line_items, support }: InvoiceFormPageProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const { isMac, shortcuts } = usePlatformShortcuts();

    const [customerOption, setCustomerOption] = useState<LookupOption<CustomerLookupRecord> | null>(
        selected_customer
            ? {
                  value: selected_customer.id,
                  label: selected_customer.name,
                  record: selected_customer,
              }
            : null,
    );
    const [lineSelections, setLineSelections] = useState<Record<number, LookupOption<ItemLookupRecord>>>(
        Object.fromEntries(
            selected_line_items.map(({ line_index, item }) => [
                line_index,
                {
                    value: item.id,
                    label: item.name,
                    record: item,
                },
            ]),
        ),
    );

    const [showQuickCustomer, setShowQuickCustomer] = useState(false);
    const [quickCustomerErrors, setQuickCustomerErrors] = useState<Record<string, string>>({});
    const [quickCustomerSaving, setQuickCustomerSaving] = useState(false);
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

    const [showQuickItem, setShowQuickItem] = useState(false);
    const [quickItemErrors, setQuickItemErrors] = useState<Record<string, string>>({});
    const [quickItemSaving, setQuickItemSaving] = useState(false);
    const [quickItemTargetRow, setQuickItemTargetRow] = useState(0);
    const [quickItemData, setQuickItemData] = useState({
        name: '',
        sku: '',
        unit_id: support.units[0]?.id ?? null,
        category_id: null as number | null,
        item_type: 'stockable',
        base_price: 0,
        selling_price: 0,
        tax_rate: 0,
        opening_stock: 0,
        reorder_level: 0,
        allow_discount: true,
        track_inventory: true,
        is_active: true,
    });

    const { data, setData, post, put, processing, errors, transform } = useForm({
        customer_id: invoice.customer_id,
        issue_date: invoice.issue_date ?? '',
        due_date: invoice.due_date ?? '',
        status: invoice.status,
        reference_number: invoice.reference_number,
        notes: invoice.notes ?? '',
        lines: invoice.lines.length ? invoice.lines : [blankLine()],
    });

    const totals = useMemo(() => calculateInvoicePreview(data.lines as InvoiceLineDraft[]), [data.lines]);
    const lineTotals = useMemo(() => data.lines.map((line) => calculateInvoiceLinePreview(line)), [data.lines]);

    const submit = (status: 'draft' | 'final') => {
        transform((currentData) => ({
            ...currentData,
            status,
            due_date: currentData.due_date || null,
            reference_number: currentData.reference_number || null,
            notes: currentData.notes || null,
        }));

        if (mode === 'create') {
            post(paths.invoices.store, { preserveScroll: true });
            return;
        }

        put(paths.invoices.update(invoice.id as number), { preserveScroll: true });
    };

    const clearVoucher = () => {
        setCustomerOption(null);
        setLineSelections({});
        setShowQuickCustomer(false);
        setShowQuickItem(false);
        setData({
            customer_id: null,
            issue_date: invoice.issue_date ?? '',
            due_date: invoice.due_date ?? '',
            status: 'draft',
            reference_number: '',
            notes: '',
            lines: [blankLine()],
        });
    };

    const addVoucherRow = (focusRow = false) => {
        const nextIndex = data.lines.length;
        setData('lines', [...data.lines, blankLine()]);

        if (focusRow) {
            setTimeout(() => {
                const target = document.querySelector<HTMLElement>(`[data-testid="invoice-line-item-${nextIndex}"] .ant-select-selector`);
                target?.focus();
                target?.click();
            }, 40);
        }
    };

    const updateLine = (index: number, updates: Partial<InvoiceLineInput>) => {
        const lines = [...data.lines];
        lines[index] = { ...lines[index], ...updates };
        setData('lines', lines);
    };

    const formatLineValue = (index: number, field: 'quantity' | 'rate' | 'discount_percent' | 'tax_percent') => {
        const decimals = field === 'quantity' ? 3 : 2;
        const value = Number(data.lines[index][field] || 0);
        updateLine(index, { [field]: Number.isFinite(value) ? value.toFixed(decimals) : (0).toFixed(decimals) });
    };

    const focusNextVoucherField = (current: HTMLElement) => {
        const fields = [...document.querySelectorAll<HTMLElement>('[data-voucher-field="true"]')];
        const index = fields.findIndex((field) => field === current);
        if (index >= 0) {
            fields[index + 1]?.focus();
        }
    };

    const handleVoucherFieldKey = (event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            focusNextVoucherField(event.currentTarget);
        }
    };

    const handleLineCellKeyDown = (index: number, fieldKey: string, event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            focusNextVoucherField(event.currentTarget);
            return;
        }

        if (event.key === 'Backspace' && fieldKey === 'description' && isRowRemovable(data.lines[index]) && data.lines.length > 1) {
            event.preventDefault();
            const lines = data.lines.filter((_, lineIndex) => lineIndex !== index);
            setData('lines', lines);
            return;
        }

        if (event.key === 'Tab' && !event.shiftKey && index === data.lines.length - 1 && fieldKey === 'tax_percent') {
            event.preventDefault();
            addVoucherRow(true);
        }
    };

    const saveQuickCustomer = async () => {
        setQuickCustomerSaving(true);
        setQuickCustomerErrors({});

        try {
            const response = await axios.post<CustomerLookupRecord>(paths.customers.store, quickCustomerData, {
                headers: { Accept: 'application/json' },
            });
            const record = response.data;
            const option: LookupOption<CustomerLookupRecord> = { value: record.id, label: record.name, record };
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

    const openQuickItem = (targetRow: number) => {
        setQuickItemTargetRow(targetRow);
        setShowQuickItem(true);
    };

    const saveQuickItem = async () => {
        setQuickItemSaving(true);
        setQuickItemErrors({});

        try {
            const response = await axios.post<ItemLookupRecord>(paths.items.store, quickItemData, {
                headers: { Accept: 'application/json' },
            });
            const record = response.data;
            const option: LookupOption<ItemLookupRecord> = {
                value: record.id,
                label: record.name,
                record,
            };

            setLineSelections((current) => ({
                ...current,
                [quickItemTargetRow]: option,
            }));

            updateLine(quickItemTargetRow, {
                item_id: record.id,
                description: record.name,
                unit_name: record.unit ?? '',
                rate: Number(record.sellingPrice || 0).toFixed(2),
                tax_percent: Number(record.taxRate || 0).toFixed(2),
            });

            setShowQuickItem(false);
            setQuickItemData((current) => ({
                ...current,
                name: '',
                sku: '',
                base_price: 0,
                selling_price: 0,
                tax_rate: 0,
                opening_stock: 0,
                reorder_level: 0,
            }));
        } catch (error: any) {
            if (error?.response?.status === 422) {
                setQuickItemErrors(error.response.data.errors ?? {});
            }
        } finally {
            setQuickItemSaving(false);
        }
    };

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: !isMac,
            meta: isMac,
            allowInInputs: true,
            handler: () => submit('draft'),
        },
        {
            key: 'Enter',
            ctrl: true,
            allowInInputs: true,
            handler: () => submit('final'),
        },
        {
            key: 'l',
            alt: true,
            allowInInputs: true,
            handler: () => addVoucherRow(true),
        },
        {
            key: 'c',
            alt: true,
            allowInInputs: true,
            handler: () => setShowQuickCustomer((current) => !current),
        },
        {
            key: 'x',
            alt: true,
            allowInInputs: true,
            handler: () => clearVoucher(),
        },
        {
            key: 'o',
            alt: true,
            allowInInputs: true,
            handler: () => document.getElementById('invoice-notes-field')?.focus(),
        },
        {
            key: 'Escape',
            allowInInputs: true,
            handler: () => router.visit(paths.invoices.index),
        },
    ]);

    return (
        <AppShell title={mode === 'create' ? 'Sales Voucher' : `Sales Voucher ${invoice.invoice_number}`} subtitle="Voucher Entry" activeKey="invoices" mode={data.status === 'final' ? 'Posted' : 'Draft'}>
            <div className="dp-form-page" data-shortcut-scope="voucher">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Voucher Header</h3>
                    </div>
                    <div className="dp-section-body">
                        <div className="dp-form-grid">
                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Date</label>
                                <BsDateInput value={data.issue_date} onChange={(value) => setData('issue_date', value)} displayBsDates={useBsDates} />
                                {errors.issue_date ? <span className="dp-error-text">{errors.issue_date}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Due Date</label>
                                <BsDateInput value={data.due_date} onChange={(value) => setData('due_date', value)} displayBsDates={useBsDates} />
                                {errors.due_date ? <span className="dp-error-text">{errors.due_date}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Mode</label>
                                <Select
                                    value={data.status}
                                    onChange={(value) => setData('status', value)}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'final', label: 'Posted' },
                                    ]}
                                />
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Voucher No</label>
                                <Input value={invoice.invoice_number ?? 'AUTO'} readOnly />
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-4">
                                <label className="dp-field-label">Reference</label>
                                <Input
                                    data-voucher-field="true"
                                    value={data.reference_number}
                                    onChange={(event) => setData('reference_number', event.target.value)}
                                    onKeyDown={handleVoucherFieldKey}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Party</h3>
                        <Space size={6}>
                            <Button onClick={() => setShowQuickCustomer((current) => !current)}>Add Customer {shortcuts.addCustomer}</Button>
                        </Space>
                    </div>
                    <div className="dp-section-body">
                        <div className="dp-field">
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
                                testId="invoice-customer-select"
                            />
                            {errors.customer_id ? <span className="dp-error-text">{errors.customer_id}</span> : null}
                        </div>

                        {showQuickCustomer ? (
                            <div style={{ marginTop: 8, border: '1px solid #999', padding: 8 }}>
                                <div className="dp-form-grid">
                                    <div className="dp-field col-span-12 xl:col-span-3">
                                        <label className="dp-field-label">Name</label>
                                        <Input
                                            data-testid="quick-customer-name"
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
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">Code</label>
                                        <Input
                                            data-testid="quick-customer-code"
                                            value={quickCustomerData.code}
                                            onChange={(event) =>
                                                setQuickCustomerData((current) => ({
                                                    ...current,
                                                    code: event.target.value,
                                                }))
                                            }
                                        />
                                        {quickCustomerErrors.code ? <span className="dp-error-text">{quickCustomerErrors.code}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">Phone</label>
                                        <Input
                                            data-testid="quick-customer-phone"
                                            value={quickCustomerData.phone}
                                            onChange={(event) =>
                                                setQuickCustomerData((current) => ({
                                                    ...current,
                                                    phone: event.target.value,
                                                }))
                                            }
                                        />
                                        {quickCustomerErrors.phone ? <span className="dp-error-text">{quickCustomerErrors.phone}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">Email</label>
                                        <Input
                                            data-testid="quick-customer-email"
                                            value={quickCustomerData.email}
                                            onChange={(event) =>
                                                setQuickCustomerData((current) => ({
                                                    ...current,
                                                    email: event.target.value,
                                                }))
                                            }
                                        />
                                        {quickCustomerErrors.email ? <span className="dp-error-text">{quickCustomerErrors.email}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-3">
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
                                        {quickCustomerErrors.billing_address ? <span className="dp-error-text">{quickCustomerErrors.billing_address}</span> : null}
                                    </div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <Space size={6}>
                                        <Button type="primary" onClick={saveQuickCustomer} loading={quickCustomerSaving}>
                                            Save Customer
                                        </Button>
                                        <Button onClick={() => setShowQuickCustomer(false)}>Cancel</Button>
                                    </Space>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Voucher Lines</h3>
                        <Space size={6}>
                            <Button onClick={() => addVoucherRow(true)}>Add Row {shortcuts.addLineRow}</Button>
                            <Button
                                onClick={() => {
                                    const target = data.lines.findIndex((line) => !line.item_id && !line.description);
                                    if (target < 0) {
                                        addVoucherRow();
                                        setQuickItemTargetRow(data.lines.length);
                                    } else {
                                        setQuickItemTargetRow(target);
                                    }
                                    setShowQuickItem((current) => !current);
                                }}
                            >
                                Add Item
                            </Button>
                        </Space>
                    </div>
                    <div className="dp-section-body">
                        <div className="dp-table-wrap">
                            <table className="dp-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 38 }}>#</th>
                                        <th style={{ width: 190 }}>Item</th>
                                        <th>Particulars</th>
                                        <th style={{ width: 78 }}>Unit</th>
                                        <th style={{ width: 84, textAlign: 'right' }}>Qty</th>
                                        <th style={{ width: 96, textAlign: 'right' }}>Rate</th>
                                        <th style={{ width: 84, textAlign: 'right' }}>Disc%</th>
                                        <th style={{ width: 84, textAlign: 'right' }}>Tax%</th>
                                        <th style={{ width: 106, textAlign: 'right' }}>Total</th>
                                        <th style={{ width: 52 }} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lines.map((line, index) => (
                                        <tr key={`line-${index}`}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <RemoteLookupSelect<ItemLookupRecord>
                                                    endpoint={paths.lookups.items}
                                                    value={lineSelections[index] ?? null}
                                                    onChange={(option) => {
                                                        if (!option) {
                                                            const next = { ...lineSelections };
                                                            delete next[index];
                                                            setLineSelections(next);
                                                            updateLine(index, { item_id: null });
                                                            return;
                                                        }

                                                        setLineSelections((current) => ({ ...current, [index]: option }));
                                                        updateLine(index, {
                                                            item_id: option.record.id,
                                                            description: option.record.name,
                                                            unit_name: option.record.unit ?? '',
                                                            rate: Number(option.record.sellingPrice || 0).toFixed(2),
                                                            tax_percent: Number(option.record.taxRate || 0).toFixed(2),
                                                        });
                                                    }}
                                                    mapOption={(record) => ({
                                                        value: Number(record.id),
                                                        label: `${record.name}${record.sku ? ` (${record.sku})` : ''}`,
                                                        record,
                                                    })}
                                                    testId={`invoice-line-item-${index}`}
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    data-voucher-field="true"
                                                    value={line.description}
                                                    onChange={(event) => updateLine(index, { description: event.target.value })}
                                                    onKeyDown={(event) => handleLineCellKeyDown(index, 'description', event)}
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    data-voucher-field="true"
                                                    value={line.unit_name}
                                                    onChange={(event) => updateLine(index, { unit_name: event.target.value })}
                                                    onKeyDown={(event) => handleLineCellKeyDown(index, 'unit_name', event)}
                                                />
                                            </td>
                                            <td>
                                                <InputNumber
                                                    controls={false}
                                                    data-voucher-field="true"
                                                    className="w-full"
                                                    value={Number(line.quantity)}
                                                    min={0.001}
                                                    step={0.001}
                                                    onChange={(value) => updateLine(index, { quantity: String(value ?? '') })}
                                                    onBlur={() => formatLineValue(index, 'quantity')}
                                                    onKeyDown={(event) => handleLineCellKeyDown(index, 'quantity', event)}
                                                />
                                            </td>
                                            <td>
                                                <InputNumber
                                                    controls={false}
                                                    data-voucher-field="true"
                                                    className="w-full"
                                                    value={Number(line.rate)}
                                                    min={0}
                                                    step={0.01}
                                                    onChange={(value) => updateLine(index, { rate: String(value ?? '') })}
                                                    onBlur={() => formatLineValue(index, 'rate')}
                                                    onKeyDown={(event) => handleLineCellKeyDown(index, 'rate', event)}
                                                />
                                            </td>
                                            <td>
                                                <InputNumber
                                                    controls={false}
                                                    data-voucher-field="true"
                                                    className="w-full"
                                                    value={Number(line.discount_percent)}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    onChange={(value) => updateLine(index, { discount_percent: String(value ?? '') })}
                                                    onBlur={() => formatLineValue(index, 'discount_percent')}
                                                    onKeyDown={(event) => handleLineCellKeyDown(index, 'discount_percent', event)}
                                                />
                                            </td>
                                            <td>
                                                <InputNumber
                                                    controls={false}
                                                    data-voucher-field="true"
                                                    className="w-full"
                                                    value={Number(line.tax_percent)}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    onChange={(value) => updateLine(index, { tax_percent: String(value ?? '') })}
                                                    onBlur={() => formatLineValue(index, 'tax_percent')}
                                                    onKeyDown={(event) => handleLineCellKeyDown(index, 'tax_percent', event)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right' }}>{lineTotals[index]?.total.toFixed(2) ?? '0.00'}</td>
                                            <td>
                                                <Button
                                                    onClick={() => {
                                                        const nextLines = data.lines.filter((_, lineIndex) => lineIndex !== index);
                                                        setData('lines', nextLines.length ? nextLines : [blankLine()]);
                                                    }}
                                                >
                                                    Del
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {errors.lines ? <span className="dp-error-text">{errors.lines}</span> : null}

                        {showQuickItem ? (
                            <div style={{ marginTop: 8, border: '1px solid #999', padding: 8 }}>
                                <div className="dp-form-grid">
                                    <div className="dp-field col-span-12 xl:col-span-3">
                                        <label className="dp-field-label">Item Name</label>
                                        <Input data-testid="quick-item-name" value={quickItemData.name} onChange={(event) => setQuickItemData((current) => ({ ...current, name: event.target.value }))} />
                                        {quickItemErrors.name ? <span className="dp-error-text">{quickItemErrors.name}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">SKU</label>
                                        <Input data-testid="quick-item-sku" value={quickItemData.sku} onChange={(event) => setQuickItemData((current) => ({ ...current, sku: event.target.value }))} />
                                        {quickItemErrors.sku ? <span className="dp-error-text">{quickItemErrors.sku}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">Unit</label>
                                        <Select
                                            value={quickItemData.unit_id}
                                            onChange={(value) => setQuickItemData((current) => ({ ...current, unit_id: value }))}
                                            options={support.units.map((unit) => ({ value: unit.id, label: unit.name }))}
                                        />
                                        {quickItemErrors.unit_id ? <span className="dp-error-text">{quickItemErrors.unit_id}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">Selling Price</label>
                                        <InputNumber
                                            id="quick-item-selling-price"
                                            data-testid="quick-item-selling-price"
                                            controls={false}
                                            className="w-full"
                                            value={quickItemData.selling_price}
                                            min={0}
                                            step={0.01}
                                            onChange={(value) => setQuickItemData((current) => ({ ...current, selling_price: Number(value || 0) }))}
                                        />
                                        {quickItemErrors.selling_price ? <span className="dp-error-text">{quickItemErrors.selling_price}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-2">
                                        <label className="dp-field-label">Tax %</label>
                                        <InputNumber
                                            id="quick-item-tax-rate"
                                            data-testid="quick-item-tax-rate"
                                            controls={false}
                                            className="w-full"
                                            value={quickItemData.tax_rate}
                                            min={0}
                                            step={0.01}
                                            onChange={(value) => setQuickItemData((current) => ({ ...current, tax_rate: Number(value || 0) }))}
                                        />
                                        {quickItemErrors.tax_rate ? <span className="dp-error-text">{quickItemErrors.tax_rate}</span> : null}
                                    </div>
                                    <div className="dp-field col-span-12 xl:col-span-1">
                                        <label className="dp-field-label">Open</label>
                                        <InputNumber
                                            id="quick-item-opening-stock"
                                            data-testid="quick-item-opening-stock"
                                            controls={false}
                                            className="w-full"
                                            value={quickItemData.opening_stock}
                                            min={0}
                                            step={0.001}
                                            onChange={(value) => setQuickItemData((current) => ({ ...current, opening_stock: Number(value || 0) }))}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <Space size={6}>
                                        <Button type="primary" onClick={saveQuickItem} loading={quickItemSaving}>
                                            Save Item
                                        </Button>
                                        <Button onClick={() => setShowQuickItem(false)}>Cancel</Button>
                                    </Space>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Totals</h3>
                    </div>
                    <div className="dp-summary-grid">
                        <span>Subtotal</span>
                        <strong>{totals.subtotal.toFixed(2)}</strong>
                        <span>Discount</span>
                        <strong>{totals.discountTotal.toFixed(2)}</strong>
                        <span>Tax</span>
                        <strong>{totals.taxTotal.toFixed(2)}</strong>
                        <span className="dp-summary-total">Grand Total</span>
                        <strong className="dp-summary-total">{totals.total.toFixed(2)}</strong>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Narration</h3>
                    </div>
                    <div className="dp-field">
                        <Input.TextArea
                            id="invoice-notes-field"
                            rows={3}
                            data-voucher-field="true"
                            value={data.notes}
                            onChange={(event) => setData('notes', event.target.value)}
                        />
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-body">
                        <Space size={6}>
                            <Button onClick={() => submit('draft')} loading={processing}>
                                Save ({shortcuts.save})
                            </Button>
                            <Button data-testid="invoice-finalize" type="primary" onClick={() => submit('final')} loading={processing}>
                                Finalize (Ctrl+Enter)
                            </Button>
                            {invoice.id ? (
                                <>
                                    <a href={paths.invoices.print(invoice.id)} target="_blank" rel="noreferrer">
                                        <Button>Print</Button>
                                    </a>
                                    <a href={paths.invoices.pdf(invoice.id)} target="_blank" rel="noreferrer">
                                        <Button>PDF</Button>
                                    </a>
                                </>
                            ) : null}
                            <Button onClick={clearVoucher}>Clear ({shortcuts.clearForm})</Button>
                            <Button onClick={() => router.visit(paths.invoices.index)}>Cancel ({shortcuts.goBack})</Button>
                        </Space>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
