import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { coerceNumber, formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Input, Select, Table } from 'antd';
import { useMemo, useState } from 'react';

interface InvoiceIndexProps {
    invoices: PaginatedResponse<{
        id: number;
        invoice_number: string;
        customer_name: string;
        issue_date: string;
        status: string;
        payment_status: string;
        total: string;
        balance_due: string;
    }>;
    filters: {
        q: string;
        status: string;
        payment_status: string;
        date_from: string;
        date_to: string;
    };
}

export default function InvoiceIndex({ invoices, filters }: InvoiceIndexProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);

    const summary = useMemo(
        () => ({
            visibleRecords: invoices.data.length,
            finalCount: invoices.data.filter((invoice) => invoice.status === 'final').length,
            unpaidCount: invoices.data.filter((invoice) => invoice.payment_status !== 'paid').length,
            pageBalance: invoices.data.reduce((carry, invoice) => carry + coerceNumber(invoice.balance_due), 0),
        }),
        [invoices.data],
    );

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.invoices.index,
            {
                ...localFilters,
                page: nextPage,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppShell title="Invoice Register" subtitle="Sales Voucher List" activeKey="invoices">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Summary</h3>
                    </div>
                    <ul className="dp-section-list">
                        <li>
                            <span>Visible</span>
                            <span>{summary.visibleRecords}</span>
                        </li>
                        <li>
                            <span>Final</span>
                            <span>{summary.finalCount}</span>
                        </li>
                        <li>
                            <span>Unpaid / Partial</span>
                            <span>{summary.unpaidCount}</span>
                        </li>
                        <li>
                            <span>Balance Due (Page)</span>
                            <span>{formatMoney(summary.pageBalance)}</span>
                        </li>
                    </ul>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Filters</h3>
                    </div>
                    <div className="dp-form-grid">
                        <div className="dp-field col-span-12 xl:col-span-3">
                            <label className="dp-field-label">Search</label>
                            <Input value={localFilters.q} onChange={(event) => setLocalFilters((current) => ({ ...current, q: event.target.value }))} onPressEnter={() => applyFilters()} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Status</label>
                            <Select
                                allowClear
                                value={localFilters.status || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, status: value ?? '' }))}
                                options={[
                                    { value: 'draft', label: 'DRAFT' },
                                    { value: 'final', label: 'FINAL' },
                                ]}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Payment</label>
                            <Select
                                allowClear
                                value={localFilters.payment_status || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, payment_status: value ?? '' }))}
                                options={[
                                    { value: 'unpaid', label: 'UNPAID' },
                                    { value: 'partial', label: 'PARTIAL' },
                                    { value: 'paid', label: 'PAID' },
                                ]}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">From</label>
                            <BsDateInput value={localFilters.date_from} onChange={(value) => setLocalFilters((current) => ({ ...current, date_from: value }))} displayBsDates={useBsDates} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">To</label>
                            <BsDateInput value={localFilters.date_to} onChange={(value) => setLocalFilters((current) => ({ ...current, date_to: value }))} displayBsDates={useBsDates} />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-1">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Button type="primary" onClick={() => applyFilters()}>
                                    Show
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Link href={paths.invoices.create}>
                            <Button type="primary">New Invoice</Button>
                        </Link>{' '}
                        <Link href={paths.reports.sales}>
                            <Button>Sales Report</Button>
                        </Link>{' '}
                        <Button
                            onClick={() => {
                                const cleared = {
                                    q: '',
                                    status: '',
                                    payment_status: '',
                                    date_from: '',
                                    date_to: '',
                                };
                                setLocalFilters(cleared);
                                router.get(paths.invoices.index, {}, { replace: true });
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Rows</h3>
                    </div>
                    <Table
                        rowKey="id"
                        size="small"
                        dataSource={invoices.data}
                        locale={{ emptyText: 'No invoices found. Create a sales voucher first.' }}
                        pagination={{
                            current: invoices.meta.currentPage,
                            total: invoices.meta.total,
                            pageSize: invoices.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Voucher',
                                render: (_, record) => (
                                    <div>
                                        <div>
                                            <Link href={paths.invoices.show(record.id)}>{record.invoice_number}</Link>
                                        </div>
                                        <div style={{ color: '#6b7280' }}>{record.customer_name}</div>
                                    </div>
                                ),
                            },
                            {
                                title: 'Date',
                                width: 118,
                                dataIndex: 'issue_date',
                                render: (value) => formatDisplayDate(value, useBsDates),
                            },
                            {
                                title: 'Status',
                                width: 160,
                                render: (_, record) => `${record.status.toUpperCase()} / ${record.payment_status.toUpperCase()}`,
                            },
                            { title: 'Total', width: 120, align: 'right', render: (_, record) => formatMoney(record.total) },
                            { title: 'Due', width: 120, align: 'right', render: (_, record) => formatMoney(record.balance_due) },
                            {
                                title: 'Actions',
                                width: 160,
                                render: (_, record) => (
                                    <>
                                        <Link href={paths.invoices.edit(record.id)}>Edit</Link> |{' '}
                                        <a href={paths.invoices.print(record.id)} target="_blank" rel="noreferrer">
                                            Print
                                        </a>
                                    </>
                                ),
                            },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
