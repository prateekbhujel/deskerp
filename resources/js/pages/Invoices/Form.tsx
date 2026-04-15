import { BsDateInput } from '@/components/forms/BsDateInput';
import { CustomerLookupRecord, QuickAddCustomerModal } from '@/components/forms/QuickAddCustomerModal';
import { ItemLookupRecord, QuickAddItemModal } from '@/components/forms/QuickAddItemModal';
import { RemoteLookupSelect } from '@/components/forms/RemoteLookupSelect';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { calculateInvoicePreview, InvoiceLineDraft } from '@/lib/invoice';
import { paths } from '@/lib/paths';
import { LookupOption, SharedProps, SimpleOption } from '@/types/shared';
import { useForm, usePage } from '@inertiajs/react';
import { Button, Card, Input, InputNumber, Select, Space, Table, Typography } from 'antd';
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

    useKeyboardShortcuts([
        {
            key: 's',
            ctrl: true,
            handler: () => submit('draft'),
        },
        {
            key: 'Enter',
            ctrl: true,
            handler: () => submit('final'),
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
                />
            ),
        },
        {
            title: 'Description',
            render: (_, line, index) => (
                <Input data-invoice-cell="true" value={line.description} onChange={(event) => updateLine(index, { description: event.target.value })} onKeyDown={handleGridKeyDown} />
            ),
        },
        {
            title: 'Unit',
            width: 100,
            render: (_, line, index) => (
                <Input data-invoice-cell="true" value={line.unit_name} onChange={(event) => updateLine(index, { unit_name: event.target.value })} onKeyDown={handleGridKeyDown} />
            ),
        },
        {
            title: 'Qty',
            width: 110,
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
            width: 120,
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
            width: 110,
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
            width: 110,
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
            title: '',
            width: 70,
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
            subtitle="Ctrl+S saves draft. Ctrl+Enter finalizes. Alt+N and Alt+P remain available globally."
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
                    <Button type="primary" onClick={() => submit('final')} loading={processing}>
                        Finalize
                    </Button>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Card title="Voucher Header">
                    <div className="grid gap-4 xl:grid-cols-4">
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

                        <div className="xl:col-span-3">
                            <Typography.Text strong>Reference Number</Typography.Text>
                            <Input style={{ marginTop: 8 }} value={data.reference_number} onChange={(event) => setData('reference_number', event.target.value)} />
                        </div>
                    </div>
                </Card>

                <Card
                    title="Line Items"
                    extra={
                        <Space>
                            <Button
                                onClick={() => {
                                    setItemTargetRow(data.lines.length);
                                    setData('lines', [...data.lines, blankLine()]);
                                }}
                            >
                                Add Row
                            </Button>
                            <Button
                                onClick={() => {
                                    const firstEmptyIndex = data.lines.findIndex((line) => !line.item_id && !line.description);
                                    setItemTargetRow(firstEmptyIndex >= 0 ? firstEmptyIndex : data.lines.length);
                                    if (firstEmptyIndex < 0) {
                                        setData('lines', [...data.lines, blankLine()]);
                                    }
                                    setItemModalOpen(true);
                                }}
                            >
                                + Add Item
                            </Button>
                        </Space>
                    }
                >
                    <Table rowKey={(_, index) => index ?? 0} size="small" pagination={false} columns={columns} dataSource={data.lines} scroll={{ x: 1100 }} />
                    {errors.lines ? <Typography.Text type="danger">{errors.lines}</Typography.Text> : null}
                </Card>

                <Card title="Notes">
                    <Input.TextArea rows={4} value={data.notes} onChange={(event) => setData('notes', event.target.value)} />
                </Card>

                <Card title="Preview Totals">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card size="small">
                            <Typography.Text type="secondary">Subtotal</Typography.Text>
                            <Typography.Title level={4} style={{ margin: '8px 0 0' }}>
                                {totals.subtotal.toFixed(2)}
                            </Typography.Title>
                        </Card>
                        <Card size="small">
                            <Typography.Text type="secondary">Discount</Typography.Text>
                            <Typography.Title level={4} style={{ margin: '8px 0 0' }}>
                                {totals.discountTotal.toFixed(2)}
                            </Typography.Title>
                        </Card>
                        <Card size="small">
                            <Typography.Text type="secondary">Tax</Typography.Text>
                            <Typography.Title level={4} style={{ margin: '8px 0 0' }}>
                                {totals.taxTotal.toFixed(2)}
                            </Typography.Title>
                        </Card>
                        <Card size="small">
                            <Typography.Text type="secondary">Total</Typography.Text>
                            <Typography.Title level={4} style={{ margin: '8px 0 0' }}>
                                {totals.total.toFixed(2)}
                            </Typography.Title>
                        </Card>
                    </div>
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
