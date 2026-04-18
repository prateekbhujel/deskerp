import { BsDateInput } from '@/components/forms/BsDateInput';
import { CustomerLookupRecord, QuickAddCustomerModal } from '@/components/forms/QuickAddCustomerModal';
import { ItemLookupRecord, QuickAddItemModal } from '@/components/forms/QuickAddItemModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { calculateInvoiceLinePreview, calculateInvoicePreview, InvoiceLineDraft } from '@/lib/invoice';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps, SimpleOption } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Card, Input, InputNumber, Select, Space, Table, Tag, Typography } from 'antd';
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
            lines: currentData.lines.filter((line) => line.description.trim() || line.item_id),
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

    const focusFirstVoucherCell = () => {
        const target = document.querySelector<HTMLElement>('[data-invoice-cell="true"]');
        target?.focus();
    };

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: true,
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
            handler: () => addVoucherRow(),
        },
        {
            key: 'l',
            alt: true,
            allowInInputs: true,
            handler: () => focusFirstVoucherCell(),
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
            title: '#',
            width: 48,
            render: (_, __, index) => <span className="dp-mono text-xs text-slate-500">{index + 1}</span>,
        },
        {
            title: 'Item / Search',
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
                    min={0}
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
            title: 'Line Total',
            width: 116,
            align: 'right',
            render: (_, __, index) => lineTotals[index]?.total.toFixed(2) ?? '0.00',
        },
        {
            title: '',
            width: 72,
            render: (_, __, index) => (
                <Button
                    danger
                    type="text"
                    onClick={() => {
                        const nextLines = data.lines.filter((_, lineIndex) => lineIndex !== index);
                        setData('lines', nextLines.length ? nextLines : [blankLine()]);
                    }}
                >
                    Remove
                </Button>
            ),
        },
    ];

    return (
        <AppShell
            title={mode === 'create' ? 'New Invoice' : `Edit ${invoice.invoice_number}`}
            subtitle="Ctrl+S save draft, Ctrl+Enter finalize, Alt+C add customer, Alt+I add item."
            activeKey="invoices"
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
                </Space>
            }
        >
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Card title="Invoice Header" className="dp-dense-card">
                        <div className="grid gap-3 xl:grid-cols-6">
                            <div className="xl:col-span-2">
                                <Typography.Text strong>Party Account</Typography.Text>
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
                                            testId="invoice-customer-select"
                                        />
                                    </div>
                                    <Button data-testid="invoice-add-customer" onClick={() => setCustomerModalOpen(true)}>
                                        + Customer
                                    </Button>
                                </Space.Compact>
                                {errors.customer_id ? <Typography.Text type="danger">{errors.customer_id}</Typography.Text> : null}
                            </div>

                            <div>
                                <Typography.Text strong>Issue Date</Typography.Text>
                                <div style={{ marginTop: 8 }}>
                                    <BsDateInput value={data.issue_date} onChange={(value) => setData('issue_date', value)} displayBsDates={useBsDates} placeholder="Issue date" />
                                </div>
                                {errors.issue_date ? <Typography.Text type="danger">{errors.issue_date}</Typography.Text> : null}
                            </div>

                            <div>
                                <Typography.Text strong>Due Date</Typography.Text>
                                <div style={{ marginTop: 8 }}>
                                    <BsDateInput value={data.due_date} onChange={(value) => setData('due_date', value)} displayBsDates={useBsDates} placeholder="Due date" />
                                </div>
                                {errors.due_date ? <Typography.Text type="danger">{errors.due_date}</Typography.Text> : null}
                            </div>

                            <div>
                                <Typography.Text strong>Status</Typography.Text>
                                <Select
                                    className="w-full"
                                    style={{ marginTop: 8 }}
                                    value={data.status}
                                    onChange={(value) => setData('status', value)}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'final', label: 'Final' },
                                    ]}
                                />
                            </div>

                            <div>
                                <Typography.Text strong>Reference</Typography.Text>
                                <Input style={{ marginTop: 8 }} value={data.reference_number} onChange={(event) => setData('reference_number', event.target.value)} />
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Invoice Lines"
                        className="dp-dense-card"
                        extra={
                            <Space wrap>
                                <Tag color="blue">{activeLines} active lines</Tag>
                                <Button onClick={() => addVoucherRow()}>Add Row</Button>
                                <Button data-testid="invoice-add-item" onClick={() => openQuickItemModal()}>
                                    + Item
                                </Button>
                            </Space>
                        }
                    >
                        <Table
                            rowKey={(_, index) => index ?? 0}
                            size="small"
                            pagination={false}
                            columns={columns}
                            dataSource={data.lines}
                            locale={{ emptyText: 'No line items. Use Add Row or + Item to continue.' }}
                            scroll={{ x: 1240 }}
                        />
                        {errors.lines ? <Typography.Text type="danger">{errors.lines}</Typography.Text> : null}
                    </Card>

                    <Card title="Narration / Notes" className="dp-dense-card">
                        <Input.TextArea rows={4} value={data.notes} onChange={(event) => setData('notes', event.target.value)} placeholder="Narration, delivery note, or internal remarks" />
                    </Card>
                </Space>

                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Card title="Totals" className="dp-dense-card">
                        <div className="space-y-3">
                            <div className="dp-summary-row">
                                <span>Subtotal</span>
                                <strong>{totals.subtotal.toFixed(2)}</strong>
                            </div>
                            <div className="dp-summary-row">
                                <span>Discount</span>
                                <strong>{totals.discountTotal.toFixed(2)}</strong>
                            </div>
                            <div className="dp-summary-row">
                                <span>Tax</span>
                                <strong>{totals.taxTotal.toFixed(2)}</strong>
                            </div>
                            <div className="dp-summary-row dp-summary-row-total">
                                <span>Total</span>
                                <strong>{totals.total.toFixed(2)}</strong>
                            </div>
                        </div>
                    </Card>

                    <Card title="Summary" className="dp-dense-card">
                        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                            <div className="dp-queue-card">
                                <Typography.Text type="secondary">Customer</Typography.Text>
                                <Typography.Title level={5} style={{ margin: '6px 0 0' }}>
                                    {customerOption?.record.name || 'Select party account'}
                                </Typography.Title>
                                {customerOption?.record.phone ? <Typography.Text type="secondary">{customerOption.record.phone}</Typography.Text> : null}
                            </div>
                            <div className="dp-queue-card">
                                <Typography.Text type="secondary">Invoice Number</Typography.Text>
                                <Typography.Title level={5} style={{ margin: '6px 0 0' }}>
                                    {invoice.invoice_number || 'Will be assigned on save'}
                                </Typography.Title>
                            </div>
                            <div className="dp-queue-card">
                                <Typography.Text type="secondary">Shortcut Strip</Typography.Text>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="dp-kbd">Ctrl+S</span>
                                    <span className="dp-kbd">Ctrl+Enter</span>
                                    <span className="dp-kbd">Alt+C</span>
                                    <span className="dp-kbd">Alt+I</span>
                                    <span className="dp-kbd">Alt+A</span>
                                    <span className="dp-kbd">Alt+L</span>
                                </div>
                            </div>
                            <Typography.Text type="secondary">
                                Finalizing updates stock for inventory-tracked items and keeps outstanding balances ready for payment entry.
                            </Typography.Text>
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
