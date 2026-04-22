import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { coerceNumber, formatDisplayDate, formatMoney } from '@/lib/format';
import { paths } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { Link, router, usePage } from '@inertiajs/react';
import { Button, Input, Select, Table } from 'antd';
import { useMemo, useState } from 'react';

interface PaymentsIndexProps {
    payments: PaginatedResponse<{
        id: number;
        payment_number: string;
        direction: string;
        party_name?: string | null;
        invoice_number?: string | null;
        payment_date: string;
        method: string;
        amount: string;
    }>;
    filters: {
        q: string;
        direction: string;
        method: string;
        date_from: string;
        date_to: string;
    };
    methods: string[];
}

export default function PaymentsIndex({ payments, filters, methods }: PaymentsIndexProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);

    const summary = useMemo(
        () => ({
            visibleRecords: payments.data.length,
            receivedTotal: payments.data.filter((payment) => payment.direction === 'received').reduce((carry, payment) => carry + coerceNumber(payment.amount), 0),
            madeTotal: payments.data.filter((payment) => payment.direction === 'made').reduce((carry, payment) => carry + coerceNumber(payment.amount), 0),
            invoiceLinked: payments.data.filter((payment) => payment.invoice_number).length,
        }),
        [payments.data],
    );

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.payments.index,
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
        <AppShell title="Payments Register" subtitle="Receipt / Payment Vouchers" activeKey="payments">
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
                            <span>Received (Page)</span>
                            <span>{formatMoney(summary.receivedTotal)}</span>
                        </li>
                        <li>
                            <span>Made (Page)</span>
                            <span>{formatMoney(summary.madeTotal)}</span>
                        </li>
                        <li>
                            <span>Invoice Linked</span>
                            <span>{summary.invoiceLinked}</span>
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
                            <label className="dp-field-label">Direction</label>
                            <Select
                                allowClear
                                value={localFilters.direction || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, direction: value ?? '' }))}
                                options={[
                                    { value: 'received', label: 'RECEIVED' },
                                    { value: 'made', label: 'MADE' },
                                ]}
                            />
                        </div>
                        <div className="dp-field col-span-12 xl:col-span-2">
                            <label className="dp-field-label">Method</label>
                            <Select
                                allowClear
                                value={localFilters.method || undefined}
                                onChange={(value) => setLocalFilters((current) => ({ ...current, method: value ?? '' }))}
                                options={methods.map((method) => ({ value: method, label: method.toUpperCase() }))}
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
                            <Button type="primary" onClick={() => applyFilters()}>
                                Show
                            </Button>
                        </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Link href={paths.payments.createReceived}>
                            <Button type="primary">Receive Payment</Button>
                        </Link>{' '}
                        <Link href={paths.payments.createMade}>
                            <Button>Make Payment</Button>
                        </Link>{' '}
                        <Link href={paths.reports.payments}>
                            <Button>Payment Report</Button>
                        </Link>{' '}
                        <Button
                            onClick={() => {
                                const cleared = {
                                    q: '',
                                    direction: '',
                                    method: '',
                                    date_from: '',
                                    date_to: '',
                                };
                                setLocalFilters(cleared);
                                router.get(paths.payments.index, {}, { replace: true });
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
                        dataSource={payments.data}
                        locale={{ emptyText: 'No payment entries found.' }}
                        pagination={{
                            current: payments.meta.currentPage,
                            total: payments.meta.total,
                            pageSize: payments.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            {
                                title: 'Voucher',
                                render: (_, record) => (
                                    <div>
                                        <div>
                                            <Link href={paths.payments.show(record.id)}>{record.payment_number}</Link>
                                        </div>
                                        <div style={{ color: '#6b7280' }}>{record.party_name || '-'}</div>
                                    </div>
                                ),
                            },
                            { title: 'Type', width: 116, render: (_, record) => record.direction.toUpperCase() },
                            { title: 'Invoice', render: (_, record) => record.invoice_number || '-' },
                            { title: 'Date', width: 118, dataIndex: 'payment_date', render: (value) => formatDisplayDate(value, useBsDates) },
                            { title: 'Method', width: 120, dataIndex: 'method' },
                            { title: 'Amount', width: 120, align: 'right', render: (_, record) => formatMoney(record.amount) },
                            { title: 'Action', width: 80, render: (_, record) => <Link href={paths.payments.edit(record.id)}>Edit</Link> },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
