import { BsDateInput } from '@/components/forms/BsDateInput';
import { CustomerLookupRecord, QuickAddCustomerModal } from '@/components/forms/QuickAddCustomerModal';
import { ItemLookupRecord, QuickAddItemModal } from '@/components/forms/QuickAddItemModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlatformShortcuts } from '@/hooks/usePlatformShortcuts';
import { calculateInvoiceLinePreview, calculateInvoicePreview, InvoiceLineDraft } from '@/lib/invoice';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps, SimpleOption } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Input, InputNumber, Select, Space, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { KeyboardEvent as ReactKeyboardEvent, useMemo, useState } from 'react';

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
        lines: Array<{
            item_id: number | null;
            description: string;
            unit_name: string;
            quantity: string;
            rate: string;
            discount_percent: string;
            tax_percent: string;
        }>;
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

function blankLine() {
    return {
        item_id: null,
        description: '',
        unit_name: '',
        quantity: '1',
        rate: '0.00',
        discount_percent: '0',
        tax_percent: '0',
    };
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
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [itemTargetRow, setItemTargetRow] = useState(0);
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
    const activeLines = useMemo(() => data.lines.filter((line) => line.description.trim() || line.item_id).length, [data.lines]);

    const submit = (status: 'draft' | 'final') => {
        transform((currentData) => ({
            ...currentData,
            status,
            due_date: currentData.due_date || null,
            reference_number: currentData.reference_number || null,
            notes: currentData.notes || null,
        }));

        const options = {
            preserveScroll: true,
        };

        if (mode === 'create') {
            post(paths.invoices.store, options);
            return;
        }

        put(paths.invoices.update(invoice.id as number), options);
    };

    const addVoucherRow = () => {
        setItemTargetRow(data.lines.length);
        setData('lines', [...data.lines, blankLine()]);
    };

    const openQuickItemModal = () => {
        const firstEmptyIndex = data.lines.findIndex((line) => !line.item_id && !line.description);
        setItemTargetRow(firstEmptyIndex >= 0 ? firstEmptyIndex : data.lines.length);

        if (firstEmptyIndex < 0) {
            setData('lines', [...data.lines, blankLine()]);
        }

        setItemModalOpen(true);
    };

    const focusFirstAmountCell = () => {
        const target = document.querySelector<HTMLElement>('[data-invoice-rate="true"]');
        target?.focus();
    };

    const clearVoucher = () => {
        setCustomerOption(null);
        setLineSelections({});
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
            key: 'c',
            alt: true,
            allowInInputs: true,
            handler: () => setCustomerModalOpen(true),
        },
        {
            key: 'i',
            alt: true,
            allowInInputs: true,
            handler: () => openQuickItemModal(),
        },
        {
            key: 'a',
            alt: true,
            allowInInputs: true,
            handler: () => focusFirstAmountCell(),
        },
        {
            key: 'l',
            alt: true,
            allowInInputs: true,
            handler: () => addVoucherRow(),
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
    ]);

    const updateLine = (index: number, updates: Partial<(typeof data.lines)[number]>) => {
        const lines = [...data.lines];
        lines[index] = {
            ...lines[index],
            ...updates,
        };
        setData('lines', lines);
    };

    const handleGridKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' || event.shiftKey) {
            return;
        }

        event.preventDefault();
        const cells = [...document.querySelectorAll<HTMLElement>('[data-invoice-cell="true"]')];
        const currentIndex = cells.findIndex((element) => element === event.currentTarget);

        if (currentIndex >= 0) {
            cells[currentIndex + 1]?.focus();
        }
    };

    const columns: ColumnsType<(typeof data.lines)[number]> = [
        {
            title: 'Item',
            width: 220,
            render: (_, line, index) => (
                <RemoteLookupSelect<ItemLookupRecord>
                    endpoint={paths.lookups.items}
                    value={lineSelections[index] ?? null}
                    onChange={(option) => {
                        if (!option) {
                            const nextSelections = { ...lineSelections };
                            delete nextSelections[index];
                            setLineSelections(nextSelections);
                            updateLine(index, { item_id: null });
                            return;
                        }

                        setLineSelections((current) => ({
                            ...current,
                            [index]: option,
                        }));
                        updateLine(index, {
                            item_id: option.record.id,
                            description: option.record.name,
                            unit_name: option.record.unit ?? '',
                            rate: String(option.record.sellingPrice ?? '0'),
                            tax_percent: String(option.record.taxRate ?? '0'),
                        });
                    }}
                    mapOption={(record) => ({
                        value: Number(record.id),
                        label: `${record.name}${record.sku ? ` (${record.sku})` : ''}`,
                        record,
                    })}
                    placeholder="Search item"
                    testId={`invoice-line-item-${index}`}
                />
            ),
        },
        {
            title: 'Particulars',
            render: (_, line, index) => (
                <Input data-invoice-cell="true" value={line.description} onChange={(event) => updateLine(index, { description: event.target.value })} onKeyDown={handleGridKeyDown} />
            ),
        },
        {
            title: 'Unit',
            width: 90,
            render: (_, line, index) => (
                <Input data-invoice-cell="true" value={line.unit_name} onChange={(event) => updateLine(index, { unit_name: event.target.value })} onKeyDown={handleGridKeyDown} />
            ),
        },
        {
            title: 'Qty',
            width: 94,
            render: (_, line, index) => (
                <InputNumber
                    data-invoice-cell="true"
                    className="w-full"
                    value={Number(line.quantity)}
                    min={0.001}
                    step={0.001}
                    onChange={(value) => updateLine(index, { quantity: String(value ?? '') })}
                    onKeyDown={handleGridKeyDown}
                />
            ),
        },
        {
            title: 'Rate',
            width: 108,
            render: (_, line, index) => (
                <InputNumber
                    data-invoice-cell="true"
                    data-invoice-rate="true"
                    className="w-full"
                    value={Number(line.rate)}
                    min={0}
                    step={0.01}
                    onChange={(value) => updateLine(index, { rate: String(value ?? '') })}
                    onKeyDown={handleGridKeyDown}
                />
            ),
        },
        {
            title: 'Disc %',
            width: 96,
            render: (_, line, index) => (
                <InputNumber
                    data-invoice-cell="true"
                    className="w-full"
                    value={Number(line.discount_percent)}
                    min={0}
                    max={100}
                    step={0.01}
                    onChange={(value) => updateLine(index, { discount_percent: String(value ?? '') })}
                    onKeyDown={handleGridKeyDown}
                />
            ),
        },
        {
            title: 'Tax %',
            width: 96,
            render: (_, line, index) => (
                <InputNumber
                    data-invoice-cell="true"
                    className="w-full"
                    value={Number(line.tax_percent)}
                    min={0}
                    max={100}
                    step={0.01}
                    onChange={(value) => updateLine(index, { tax_percent: String(value ?? '') })}
                    onKeyDown={handleGridKeyDown}
                />
            ),
        },
        {
            title: 'Total',
            width: 110,
            align: 'right',
            render: (_, __, index) => lineTotals[index]?.total.toFixed(2) ?? '0.00',
        },
        {
            title: 'Action',
            width: 80,
            render: (_, __, index) => (
                <Button
                    danger
                    type="text"
                    onClick={() => {
                        const nextLines = data.lines.filter((_, lineIndex) => lineIndex !== index);
                        setData('lines', nextLines.length ? nextLines : [blankLine()]);
                    }}
                >
                    Del
                </Button>
            ),
        },
    ];

    return (
        <AppShell
            title={mode === 'create' ? 'New Invoice' : `Edit ${invoice.invoice_number}`}
            subtitle={`Voucher entry | ${shortcuts.save} save | ${shortcuts.addLineRow} add row`}
            activeKey="invoices"
            mode={data.status === 'final' ? 'Posted' : 'Draft'}
            extra={
                <Space wrap>
                    {invoice.id ? (
                        <>
                            <a href={paths.invoices.print(invoice.id)} target="_blank" rel="noreferrer">
                                <Button>Print View</Button>
                            </a>
                            <a href={paths.invoices.pdf(invoice.id)} target="_blank" rel="noreferrer">
                                <Button>PDF</Button>
                            </a>
                        </>
                    ) : null}
                    <Button onClick={() => submit('draft')} loading={processing}>
                        Save Draft
                    </Button>
                    <Button data-testid="invoice-finalize" type="primary" onClick={() => submit('final')} loading={processing}>
                        Finalize Invoice
                    </Button>
                    <Button onClick={clearVoucher}>Clear ({shortcuts.clearForm})</Button>
                </Space>
            }
        >
            <div className="dp-form-page" data-shortcut-scope="voucher">
                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Voucher Header</h3>
                        <span>{activeLines} line(s)</span>
                    </div>
                    <div className="dp-form-section-body">
                        <div className="dp-form-grid">
                            <div className="dp-field col-span-12 xl:col-span-4">
                                <label className="dp-field-label">Party Account</label>
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
                                            testId="invoice-customer-select"
                                        />
                                    </div>
                                    <Button data-testid="invoice-add-customer" onClick={() => setCustomerModalOpen(true)}>
                                        Customer
                                    </Button>
                                </Space.Compact>
                                {errors.customer_id ? <span className="dp-error-text">{errors.customer_id}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Issue Date</label>
                                <BsDateInput value={data.issue_date} onChange={(value) => setData('issue_date', value)} displayBsDates={useBsDates} placeholder="Issue date" />
                                {errors.issue_date ? <span className="dp-error-text">{errors.issue_date}</span> : null}
                            </div>

                            <div className="dp-field col-span-12 xl:col-span-2">
                                <label className="dp-field-label">Due Date</label>
                                <BsDateInput value={data.due_date} onChange={(value) => setData('due_date', value)} displayBsDates={useBsDates} placeholder="Due date" />
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
                                <label className="dp-field-label">Reference</label>
                                <Input value={data.reference_number} onChange={(event) => setData('reference_number', event.target.value)} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Allocation</h3>
                        <Space size={6}>
                            <Button onClick={() => addVoucherRow()}>Add Row</Button>
                            <Button data-testid="invoice-add-item" onClick={() => openQuickItemModal()}>
                                Search Item
                            </Button>
                        </Space>
                    </div>
                    <div className="dp-form-section-body">
                        <div className="dp-field">
                            <label className="dp-field-label">Notes</label>
                            <Input.TextArea
                                id="invoice-notes-field"
                                rows={3}
                                value={data.notes}
                                onChange={(event) => setData('notes', event.target.value)}
                                placeholder="Narration or reference notes"
                            />
                        </div>
                    </div>
                </section>

                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Voucher Lines</h3>
                        <span>{shortcuts.addLineRow} add row</span>
                    </div>
                    <div className="dp-form-section-body">
                        <Table
                            rowKey={(_, index) => index ?? 0}
                            size="small"
                            pagination={false}
                            columns={columns}
                            dataSource={data.lines}
                            locale={{ emptyText: 'No line items. Add a row to begin.' }}
                            scroll={{ x: 1120 }}
                        />
                        {errors.lines ? <span className="dp-error-text">{errors.lines}</span> : null}
                    </div>
                </section>

                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Totals</h3>
                        <span>{data.status === 'final' ? 'Posted' : 'Draft'}</span>
                    </div>
                    <div className="dp-form-section-body">
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
                    </div>
                </section>

                <section className="dp-form-section">
                    <div className="dp-form-section-head">
                        <h3 className="dp-form-section-title">Shortcuts</h3>
                    </div>
                    <div className="dp-form-section-body">
                        <Space size={6} wrap>
                            <span className="dp-kbd">{shortcuts.save}</span>
                            <span className="dp-kbd">Ctrl+Enter</span>
                            <span className="dp-kbd">{shortcuts.addCustomer}</span>
                            <span className="dp-kbd">{shortcuts.searchInvoice}</span>
                            <span className="dp-kbd">{shortcuts.focusAmount}</span>
                            <span className="dp-kbd">{shortcuts.addLineRow}</span>
                            <span className="dp-kbd">{shortcuts.clearForm}</span>
                            <span className="dp-kbd">{shortcuts.notesField}</span>
                        </Space>
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

            <QuickAddItemModal
                open={itemModalOpen}
                onClose={() => setItemModalOpen(false)}
                units={support.units}
                categories={support.categories}
                onCreated={(option) => {
                    setLineSelections((current) => ({
                        ...current,
                        [itemTargetRow]: option,
                    }));
                    updateLine(itemTargetRow, {
                        item_id: option.record.id,
                        description: option.record.name,
                        unit_name: option.record.unit ?? '',
                        rate: String(option.record.sellingPrice ?? '0'),
                        tax_percent: String(option.record.taxRate ?? '0'),
                    });
                }}
            />
        </AppShell>
    );
}
