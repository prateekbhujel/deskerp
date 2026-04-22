import { BsDateInput } from '@/components/forms/BsDateInput';
import { AppShell } from '@/components/layout/AppShell';
import { formatDisplayDate, formatMoney } from '@/lib/format';
import { paths, withQuery } from '@/lib/paths';
import { PaginatedResponse, SharedProps } from '@/types/shared';
import { router, usePage } from '@inertiajs/react';
import { Button, Select, Table } from 'antd';
import { useState } from 'react';

interface PaymentsReportProps {
    payments: PaginatedResponse<{
        id: number;
        payment_date: string;
        payment_number: string;
        direction: string;
        party_name?: string | null;
        invoice_number?: string | null;
        method: string;
        reference_number?: string | null;
        amount: string;
    }>;
    summary: {
        received: number;
        made: number;
    };
    filters: {
        direction: string;
        method: string;
        date_from: string;
        date_to: string;
    };
}

export default function PaymentsReport({ payments, summary, filters }: PaymentsReportProps) {
    const page = usePage<SharedProps>();
    const useBsDates = page.props.settings.displayBsDates;
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = (nextPage = 1) => {
        router.get(
            paths.reports.payments,
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
        <AppShell title="Payment Report" subtitle="Receipt / Payment Register" activeKey="reports">
            <div className="dp-form-page">
                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Summary</h3>
                    </div>
                    <div className="dp-summary-grid">
                        <span>Received</span>
                        <strong>{formatMoney(summary.received)}</strong>
                        <span className="dp-summary-total">Made</span>
                        <strong className="dp-summary-total">{formatMoney(summary.made)}</strong>
                    </div>
                </section>

                <section className="dp-section-block">
                    <div className="dp-section-head">
                        <h3 className="dp-section-title">Filters</h3>
                    </div>
                    <div className="dp-form-grid">
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
                                options={['cash', 'bank', 'card', 'cheque', 'online'].map((method) => ({ value: method, label: method.toUpperCase() }))}
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
                        <div className="dp-field col-span-12 xl:col-span-4">
                            <label className="dp-field-label">Actions</label>
                            <div>
                                <Button type="primary" onClick={() => applyFilters()}>
                                    Show
                                </Button>{' '}
                                <a href={withQuery(paths.reports.payments, { ...localFilters, export: 'csv' })}>
                                    <Button>Export CSV</Button>
                                </a>{' '}
                                <a href={withQuery(paths.reports.payments, { ...localFilters, export: 'xlsx' })}>
                                    <Button>Export XLSX</Button>
                                </a>
                            </div>
                        </div>
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
                        locale={{ emptyText: 'No payment rows for current filters.' }}
                        pagination={{
                            current: payments.meta.currentPage,
                            total: payments.meta.total,
                            pageSize: payments.meta.perPage,
                            onChange: (pageNumber) => applyFilters(pageNumber),
                        }}
                        columns={[
                            { title: 'Date', render: (_, record) => formatDisplayDate(record.payment_date, useBsDates) },
                            { title: 'Number', dataIndex: 'payment_number' },
                            { title: 'Type', dataIndex: 'direction' },
                            { title: 'Party', dataIndex: 'party_name', render: (value) => value || '-' },
                            { title: 'Invoice', dataIndex: 'invoice_number', render: (value) => value || '-' },
                            { title: 'Method', dataIndex: 'method' },
                            { title: 'Reference', dataIndex: 'reference_number', render: (value) => value || '-' },
                            { title: 'Amount', align: 'right', render: (_, record) => formatMoney(record.amount) },
                        ]}
                    />
                </section>
            </div>
        </AppShell>
    );
}
